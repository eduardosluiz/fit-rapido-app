import { WorkoutAccessGuard } from './workout-access.guard';
describe('WorkoutAccessGuard', () => {
  const auth = { findById: jest.fn() };
  const guard = new WorkoutAccessGuard(auth as any);
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
});
