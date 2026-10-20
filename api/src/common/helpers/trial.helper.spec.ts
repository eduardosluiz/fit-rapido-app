import { hasActiveTrial, TRIAL_DURATION_MS } from './trial.helper';
import { canAccessRecipe, canAccessTreino } from './subscription.helper';
import { WorkoutAccessGuard } from '../../treinos/workout-access.guard';

describe('teste gratuito de 72 horas', () => {
  const created = new Date('2026-10-01T12:00:00Z');
  const user: any = { role: 'user', subscription_tier: 'free', created_at: created, trial_expires_at: new Date('2026-10-08T12:00:00Z') };
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(created.getTime() + TRIAL_DURATION_MS - 1); });
  afterEach(() => jest.useRealTimers());
  it('libera apenas Free até 1ms antes e bloqueia no limite, mesmo com prazo antigo de 7 dias', () => {
    expect(hasActiveTrial(user)).toBe(true);
    expect(canAccessRecipe(user, { is_free: true } as any)).toBe(true);
    expect(canAccessRecipe(user, { is_free: false } as any)).toBe(false);
    jest.advanceTimersByTime(1);
    expect(hasActiveTrial(user)).toBe(false);
    expect(canAccessRecipe(user, { is_free: true } as any)).toBe(false);
  });
  it.each([null, {}, { trial_expires_at: user.trial_expires_at }, { ...user, created_at: 'invalid' }, { ...user, trial_expires_at: created }, { ...user, created_at: '2027-01-01' }])('não libera datas ausentes, inválidas, futuras ou vencidas', value => {
    expect(hasActiveTrial(value as any)).toBe(false);
  });
  it('assinaturas liberam apenas o plano contratado após o teste', () => {
    jest.advanceTimersByTime(1);
    for (const tier of ['premium', 'premium_fit']) {
      const paid = { ...user, subscription_tier: tier };
      expect(canAccessRecipe(paid, { is_free: true } as any)).toBe(true);
      expect(canAccessRecipe(paid, { is_free: false } as any)).toBe(true);
      expect(canAccessTreino(paid)).toBe(tier === 'premium_fit');
    }
  });
  it.each(['TreinosController', 'ExerciciosBibliotecaController'])('protege links diretos Free de %s no vencimento', async name => {
    const guard = new WorkoutAccessGuard({ findById: async () => user } as any, {
      findOne: async () => ({ ativa: true, is_free: true }), find: async () => [{ ativa: true, is_free: true }],
    } as any);
    const context: any = { switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'u' }, params: { id: 't' } }) }), getClass: () => ({ name }) };
    await expect(guard.canActivate(context)).resolves.toBe(true);
    jest.advanceTimersByTime(1);
    await expect(guard.canActivate(context)).rejects.toThrow('assinatura');
  });
});
