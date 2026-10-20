import { generateKeyPairSync } from 'crypto';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { SocialTokenVerifierService } from './social-token-verifier.service';
jest.mock('axios');
describe('SocialTokenVerifierService', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue({ data: { keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'test-key' }] } });
  });
  const token = (audience = 'com.fitrapido.app') => jwt.sign({ sub: 'apple-user', email: 'test@example.com', email_verified: true }, privateKey, {
    algorithm: 'RS256', keyid: 'test-key', issuer: 'https://appleid.apple.com', audience, expiresIn: 60,
  });
  it('aceita identidade assinada para nosso aplicativo', async () => {
    await expect(new SocialTokenVerifierService().verify('apple', token())).resolves.toEqual({ id: 'apple-user', email: 'test@example.com' });
  });
  it('rejeita token de outro aplicativo', async () => {
    await expect(new SocialTokenVerifierService().verify('apple', token('other.app'))).rejects.toThrow();
  });
  it('rejeita token adulterado antes de criar sessão', async () => {
    const parts = token().split('.');
    parts[1] = Buffer.from(JSON.stringify({ sub: 'attacker', email: 'victim@example.com' })).toString('base64url');
    await expect(new SocialTokenVerifierService().verify('apple', parts.join('.'))).rejects.toThrow();
  });
});

describe('validação de identidade Google', () => {
  const previous = process.env.GOOGLE_WEB_CLIENT_ID;
  beforeEach(() => { process.env.GOOGLE_WEB_CLIENT_ID = 'test-client'; });
  afterAll(() => { if (previous === undefined) delete process.env.GOOGLE_WEB_CLIENT_ID; else process.env.GOOGLE_WEB_CLIENT_ID = previous; });
  it.each([['test-client', true, true], ['other-client', true, false], ['test-client', false, false]])('confere audiência e e-mail verificado (%s, %s)', async (aud, verified, valid) => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { aud, email_verified: verified, sub: 'google-user', email: 'test@example.invalid' } });
    const result = new SocialTokenVerifierService().verify('google', 'token');
    if (valid) await expect(result).resolves.toEqual({ id: 'google-user', email: 'test@example.invalid' });
    else await expect(result).rejects.toThrow();
  });
});
