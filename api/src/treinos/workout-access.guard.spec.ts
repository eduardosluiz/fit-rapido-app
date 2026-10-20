import { WorkoutAccessGuard } from './workout-access.guard';
describe('WorkoutAccessGuard', () => {
  const auth = { findById: jest.fn() };
  const guard = new WorkoutAccessGuard(auth as any, {} as any);
  const context = { switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'user' } }) }) } as any;
  it('nega acesso direto ao vídeo com assinatura expirada', async () => {
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'premium_fit', subscription_expires_at: new Date(0) });
    await expect(guard.canActivate(context)).rejects.toThrow('assinatura');
  });
  it('permite a assinatura vigente e o trabalho editorial do administrador', async () => {
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'premium_fit', subscription_expires_at: new Date(Date.now() + 60000) });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    auth.findById.mockResolvedValue({ role: 'admin' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
  it('permite Free explícito e bloqueia o mesmo link após revogar a liberação', async () => {
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'free', created_at: new Date(Date.now() - 3600000), trial_expires_at: new Date(Date.now() + 3600000) });
    const repo = { findOne: jest.fn().mockResolvedValue({ ativa: true, is_free: true }) };
    const guard = new WorkoutAccessGuard(auth as any, repo as any);
    const ctx: any = { switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'u' }, params: { id: 't' } }) }), getClass: () => ({ name: 'TreinosController' }) };
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    repo.findOne.mockResolvedValue({ ativa: true, is_free: false });
    await expect(guard.canActivate(ctx)).rejects.toThrow('assinatura');
  });
  it('libera só substituto ligado a um treino gratuito, sem abrir a biblioteca inteira', async () => {
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'free', created_at: new Date(Date.now() - 3600000), trial_expires_at: new Date(Date.now() + 3600000) });
    const repo = { find: jest.fn().mockResolvedValue([{ ativa: true, is_free: true }]) };
    const guard = new WorkoutAccessGuard(auth as any, repo as any);
    const ctx: any = { switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'u' }, params: { id: 's' } }) }), getClass: () => ({ name: 'ExerciciosBibliotecaController' }) };
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    repo.find.mockResolvedValue([]);
    await expect(guard.canActivate(ctx)).rejects.toThrow('assinatura');
    await expect(guard.canActivate(context)).rejects.toThrow('assinatura');
  });
});
