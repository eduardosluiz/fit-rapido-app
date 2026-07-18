import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Bloquear tentativas de exploit de Server Actions (Botnets Kinsing/Mirai)
  // O botnet envia requisições com o header Next-Action falso (ex: "x")
  // Como este projeto não utiliza Server Actions, podemos bloquear qualquer requisição com este header
  if (request.headers.has('Next-Action') || request.nextUrl.searchParams.has('_next_action')) {
    console.warn(`[Botnet Blocked] Malicious Server Action request from IP: ${request.ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Bloquear URLs com comandos shell (apt-get, wget, curl, etc)
  const urlLower = request.nextUrl.pathname.toLowerCase();
  if (
    urlLower.includes('apt-get') ||
    urlLower.includes('curl') ||
    urlLower.includes('wget') ||
    urlLower.includes('pkill')
  ) {
    console.warn(`[Botnet Blocked] Malicious URL request from IP: ${request.ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

// Configurar o matcher para rodar em todas as rotas
export const config = {
  matcher: '/:path*',
};
