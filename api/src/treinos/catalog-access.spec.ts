import { TreinosService } from './treinos.service';
import { ReceitasService } from '../receitas/receitas.service';

function repository(items: any[]) {
  const qb: any = {};
  for (const name of ['select', 'addSelect', 'where', 'andWhere', 'leftJoinAndSelect', 'orderBy', 'addOrderBy', 'skip', 'take']) qb[name] = jest.fn().mockReturnValue(qb);
  qb.getMany = jest.fn().mockResolvedValue(items);
  qb.getManyAndCount = jest.fn().mockResolvedValue([items, items.length]);
  return { createQueryBuilder: () => qb };
}

describe('catálogo completo com acesso restrito', () => {
  const freeUser: any = { role: 'user', subscription_tier: 'free' };
  it('lista treinos pagos sem vídeos ou instruções, preserva paginação e libera Free', async () => {
    const items = [
      { id: 'free', ativa: true, is_free: true, video_url: 'free-video' },
      { id: 'paid', ativa: true, is_free: false, video_url: 'secret-video', descricao: 'secret-instructions', substituto_1_info: { video_url: 'secret-substitute' } },
    ];
    const service = new TreinosService(repository(items) as any, {} as any, {} as any);
    const args: any[] = Array(11).fill(undefined);
    const response = await (service.findAll as any)(...args, freeUser, 1, 10);
    expect(response.total).toBe(2);
    expect(response.data[0]).toMatchObject({ locked: false, video_url: 'free-video' });
    expect(response.data[1]).toMatchObject({ id: 'paid', locked: true });
    expect(JSON.stringify(response)).not.toContain('secret');
  });
  it.each(['free', 'premium', 'premium_fit'])('receitas: aplica acesso correspondente ao plano %s', async tier => {
    const items = [
      { id: 'free', ativa: true, is_free: true, video_url: 'free-video' },
      { id: 'paid', ativa: true, is_free: false, video_url: 'secret-video', ingredientes: ['secret-ingredient'], modo_preparo: ['secret-instructions'], proteinas: '20' },
    ];
    const service = new ReceitasService(repository(items) as any, {} as any, {} as any, {} as any);
    const args: any[] = Array(14).fill(undefined);
    const response = await (service.findAll as any)(...args, { ...freeUser, subscription_tier: tier }, 1, 10);
    expect(response.total).toBe(2);
    expect(response.data[0].locked).toBe(false);
    expect(response.data[1].locked).toBe(tier === 'free');
    expect(response.data[1].proteinas).toBe('20');
    if (tier === 'free') expect(JSON.stringify(response)).not.toContain('secret');
    else expect(response.data[1].video_url).toBe('secret-video');
  });
  it('plano de receitas não libera vídeo de treino pago', async () => {
    const service = new TreinosService(repository([{ id: 'paid', ativa: true, video_url: 'secret' }]) as any, {} as any, {} as any);
    const args: any[] = Array(11).fill(undefined);
    const result = await (service.findAll as any)(...args, { ...freeUser, subscription_tier: 'premium' });
    expect(result[0].locked).toBe(true);
    expect(JSON.stringify(result)).not.toContain('secret');
  });
});
