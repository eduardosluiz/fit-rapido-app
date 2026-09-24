import { BadRequestException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { createPublicKey } from 'crypto';
import * as jwt from 'jsonwebtoken';

interface VerifiedSocialIdentity {
  id: string;
  email?: string;
}

interface AppleJsonWebKey {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}

@Injectable()
export class SocialTokenVerifierService {
  private appleKeys: { keys: AppleJsonWebKey[]; expiresAt: number } | null = null;

  async verify(provider: string, token: string): Promise<VerifiedSocialIdentity> {
    if (provider === 'google') return this.verifyGoogle(token);
    if (provider === 'apple') return this.verifyApple(token);
    throw new BadRequestException('Provedor social inválido');
  }

  private async verifyGoogle(token: string): Promise<VerifiedSocialIdentity> {
    const allowedAudiences = [
      process.env.GOOGLE_WEB_CLIENT_ID,
      process.env.GOOGLE_IOS_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
    ].filter(Boolean) as string[];

    if (allowedAudiences.length === 0) {
      throw new ServiceUnavailableException('Login com Google ainda não configurado');
    }

    try {
      const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: token },
        timeout: 5000,
      });

      const emailVerified = data.email_verified === 'true' || data.email_verified === true;
      if (!allowedAudiences.includes(data.aud) || !emailVerified || typeof data.sub !== 'string' || !data.sub || typeof data.email !== 'string') {
        throw new UnauthorizedException('Token do Google inválido');
      }

      return { id: data.sub, email: data.email };
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Não foi possível validar o token do Google');
    }
  }

  private async verifyApple(token: string): Promise<VerifiedSocialIdentity> {
    const audience = process.env.APPLE_CLIENT_ID || 'com.fitrapido.app';
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && typeof decoded !== 'string' ? decoded.header.kid : undefined;
    if (!kid) throw new UnauthorizedException('Token da Apple inválido');

    try {
      const keys = await this.getAppleKeys();
      const jwk = keys.find(key => key.kid === kid);
      if (!jwk) throw new UnauthorizedException('Chave pública da Apple não encontrada');

      const publicKey = createPublicKey({ key: jwk as any, format: 'jwk' });
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience,
      }) as jwt.JwtPayload;

      if (!payload.sub) throw new UnauthorizedException('Token da Apple inválido');
      return {
        id: payload.sub,
        email: typeof payload.email === 'string' && (payload.email_verified === true || payload.email_verified === 'true') ? payload.email : undefined,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Não foi possível validar o token da Apple');
    }
  }

  private async getAppleKeys(): Promise<AppleJsonWebKey[]> {
    if (this.appleKeys && this.appleKeys.expiresAt > Date.now()) return this.appleKeys.keys;

    try {
      const { data } = await axios.get<{ keys: AppleJsonWebKey[] }>('https://appleid.apple.com/auth/keys', {
        timeout: 5000,
      });
      this.appleKeys = { keys: data.keys, expiresAt: Date.now() + 6 * 60 * 60 * 1000 };
      return data.keys;
    } catch {
      throw new ServiceUnavailableException('Não foi possível consultar as chaves da Apple');
    }
  }
}
