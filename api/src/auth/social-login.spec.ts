import { AuthService } from './auth.service';
import { TRIAL_DURATION_MS } from '../common/helpers/trial.helper';

describe.each(['google', 'apple'])('cadastro e login %s', provider => {
  it('cria uma conta Free por identidade validada, com 72h, e não reinicia o prazo ao entrar de novo', async () => {
    const now = new Date('2026-10-20T19:00:00Z');
    jest.useFakeTimers().setSystemTime(now);
    try {
      const users = { findOne: jest.fn().mockResolvedValue(null), create: jest.fn(value => ({ ...value, id: 'test', created_at: now })), save: jest.fn(async value => value) };
      const verifier = { verify: jest.fn().mockResolvedValue({ id: 'provider-id', email: 'verified@example.invalid' }) };
      const service = new AuthService(users as any, { sign: () => 'session' } as any, verifier as any);
      const result = await service.socialLogin({ provider, token: 'provider-token', email: 'untrusted@example.invalid', name: 'Teste' } as any);
      expect(verifier.verify).toHaveBeenCalledWith(provider, 'provider-token');
      expect(result.user.email).toBe('verified@example.invalid');
      expect(result.user.subscription_tier).toBe('free');
      expect(result.user.trial_expires_at.getTime()).toBe(now.getTime() + TRIAL_DURATION_MS);
      expect(result.user[provider === 'apple' ? 'apple_id' : 'google_id']).toBe('provider-id');
      users.findOne.mockResolvedValue(result.user as any);
      users.save.mockClear();
      jest.advanceTimersByTime(86400000);
      const login = await service.socialLogin({ provider, token: 'provider-token' } as any);
      expect(login.user.trial_expires_at).toEqual(result.user.trial_expires_at);
      expect(users.save).not.toHaveBeenCalled();
    } finally { jest.useRealTimers(); }
  });
  it('não cria conta quando a validação do provedor falha', async () => {
    const users = { create: jest.fn(), findOne: jest.fn() };
    const service = new AuthService(users as any, {} as any, { verify: async () => { throw new Error('invalid'); } } as any);
    await expect(service.socialLogin({ provider, token: 'invalid' } as any)).rejects.toThrow('invalid');
    expect(users.create).not.toHaveBeenCalled();
  });
});
