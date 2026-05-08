import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard opcional que valida o token JWT se presente,
 * mas não bloqueia a requisição se não houver token ou se o token for inválido.
 * Útil para endpoints que funcionam tanto autenticados quanto não autenticados.
 */
@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Verificar se há token no header antes de tentar validar
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    // Se não houver token, permitir acesso sem autenticação
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    // Se houver token, tentar validar
    const result = super.canActivate(context);
    
    // Se for Promise, tratar erro
    if (result instanceof Promise) {
      return result.catch(() => {
        // Se falhar (token inválido), permitir continuar sem autenticação
        return true;
      });
    }
    
    // Se for Observable, tratar erro
    if (result instanceof Observable) {
      return result.pipe(
        catchError(() => {
          // Se falhar (token inválido), permitir continuar sem autenticação
          return of(true);
        })
      );
    }
    
    // Se for boolean, retornar diretamente
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Se houver erro ou não houver usuário, retornar null ao invés de lançar erro
    // Isso permite que o endpoint continue funcionando sem autenticação
    if (err || !user) {
      return null;
    }
    return user;
  }
}

