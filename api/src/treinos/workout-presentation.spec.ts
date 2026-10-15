import { TreinosModalidadesController } from './treinos-modalidades.controller';

describe('conteúdo de modalidades para Free', () => {
  const req = { user: { sub: 'u' } };
  const modality = {
    id: 'm', ativo: true, tem_nivelamento: true,
    configuracao_dias: { iniciante: { '0': { is_free: true } } },
    treinos: [
      { id: 'free', modalidade_id: 'm', ativa: true, nivel: 'iniciante', dia_semana: 0, video_url: 'free-video' },
      { id: 'paid', modalidade_id: 'm', ativa: true, nivel: 'iniciante', dia_semana: 1, video_url: 'paid-video', descricao_tecnica: 'paid-instructions' },
      { id: 'advanced', modalidade_id: 'm', ativa: true, nivel: 'avancado', dia_semana: 0, video_url: 'advanced-video' },
      { id: 'inactive', modalidade_id: 'm', ativa: false, nivel: 'iniciante', dia_semana: 0, video_url: 'inactive-video' },
    ],
  };
  const repo = { find: jest.fn(), findOne: jest.fn() };
  const auth = { findById: jest.fn() };
  const controller = new TreinosModalidadesController(repo as any, auth as any);
  beforeEach(() => {
    repo.find.mockResolvedValue([modality]);
    repo.findOne.mockResolvedValue(modality);
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'free' });
  });
  it('expõe mídia apenas da sessão liberada, mantendo título e bloqueio das demais', async () => {
    const result = await controller.findOne('m', req);
    expect(result.treinos).toHaveLength(3);
    expect(result.treinos[0]).toMatchObject({ is_free: true, video_url: 'free-video' });
    expect(result.treinos[1]).toMatchObject({ id: 'paid', locked: true, is_free: false });
    const serialized = JSON.stringify(result);
    for (const secret of ['paid-video', 'paid-instructions', 'advanced-video', 'inactive-video']) {
      expect(serialized).not.toContain(secret);
    }
  });
  it('aplica a mesma proteção na lista e não libera assinatura vencida', async () => {
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'premium_fit', subscription_expires_at: new Date(0) });
    const result = await controller.findAll(req);
    expect(result[0].treinos[1]).toMatchObject({ locked: true });
    expect(JSON.stringify(result)).not.toContain('paid-video');
  });
  it('mantém conteúdo pago para assinante e inativos apenas no editor', async () => {
    auth.findById.mockResolvedValue({ role: 'user', subscription_tier: 'premium_fit' });
    const premium = await controller.findOne('m', req);
    expect(premium.treinos).toHaveLength(3);
    expect(premium.treinos[1]).toHaveProperty('video_url', 'paid-video');
    auth.findById.mockResolvedValue({ role: 'admin' });
    expect((await controller.findOne('m', req)).treinos).toHaveLength(4);
  });
});
