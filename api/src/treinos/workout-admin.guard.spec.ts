import { WorkoutAdminGuard } from './workout-admin.guard';
describe('edição de permissões de treinos', () => {
  const auth = { findById: jest.fn() };
  const guard = new WorkoutAdminGuard(auth as any);
  const ctx: any = { switchToHttp: () => ({ getRequest: () => ({ user: { sub: 'u' } }) }) };
  it('impede que um assinante ou usuário Free libere conteúdo para si mesmo', async () => {
    for (const tier of ['free', 'premium_fit']) {
      auth.findById.mockResolvedValue({ role: 'user', subscription_tier: tier });
      await expect(guard.canActivate(ctx)).rejects.toThrow('administradores');
    }
    auth.findById.mockResolvedValue({ role: 'admin' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
