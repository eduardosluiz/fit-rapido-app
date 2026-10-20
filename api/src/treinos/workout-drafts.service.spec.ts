import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { WorkoutDraftsService } from './workout-drafts.service';
import { WorkoutDraftsController } from './workout-drafts.controller';
import { WorkoutAdminGuard } from './workout-admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkoutDraft } from './entities/workout-draft.entity';
import { Treino } from './entities/treino.entity';
import { TreinoModalidade } from './entities/treino-modalidade.entity';

// Transactional repository double: no external database or production credentials.
function harness() {
  let rows: Record<string, any[]> = { WorkoutDraft: [], Treino: [], TreinoModalidade: [], CategoriaTreino: [] };
  let failId: string | null = null;
  const matches = (row: any, where: any) => Object.entries(where).every(([k,v]) => row[k] === v);
  const manager: any = {
    query: jest.fn(async () => []),
    findOne: async (entity, options) => structuredClone(rows[entity.name].find(r => matches(r, options.where)) || null),
    findOneBy: async (entity, where) => manager.findOne(entity, { where }),
    find: async (entity, options) => structuredClone(rows[entity.name].filter(r => matches(r, options.where)).sort((a,b) => a.id.localeCompare(b.id))),
    existsBy: async (entity, where) => !!await manager.findOneBy(entity, where),
    create: (_entity, data) => ({ ...data }),
    save: jest.fn(async (entity, data) => {
      if (data.id === failId) throw new Error('simulated write failure');
      const saved = { id: randomUUID(), created_at: new Date(0), ...structuredClone(data), updated_at: new Date() };
      const index = rows[entity.name].findIndex(r => r.id === saved.id);
      if (index < 0) rows[entity.name].push(saved); else rows[entity.name][index] = saved;
      return structuredClone(saved);
    }),
    update: async (entity, id, data) => Object.assign(rows[entity.name].find(r => r.id === id), data),
    delete: async (entity, where) => { rows[entity.name] = rows[entity.name].filter(r => !matches(r, where)); },
  };
  const db: any = { transaction: jest.fn(async (...args: any[]) => {
    const before = structuredClone(rows);
    try { return await args[args.length - 1](manager); }
    catch (error) { rows = before; throw error; }
  }) };
  return { service: new WorkoutDraftsService(db), db, manager,
    rows: (type: any) => rows[type.name], failOn: (id: string) => { failId = id; } };
}

describe('rascunhos e publicação', () => {
  const lesson = (id = randomUUID()) => ({ id, titulo: 'Aula', video_url: 'https://example.com/video.mp4', ativa: true, is_free: false, dia_semana: null });
  it('protege todas as rotas com autenticação e permissão administrativa', () => {
    expect(Reflect.getMetadata('__guards__', WorkoutDraftsController)).toEqual([JwtAuthGuard, WorkoutAdminGuard]);
  });
  it('salva trabalho incompleto sem criar conteúdo no catálogo e permite reabrir', async () => {
    const h = harness(), id = randomUUID();
    const saved = await h.service.save('modalidade', id, { revision: 0, baseVersion: 'new', payload: {
      content: { nome: 'Em preparação' }, treinos: [{ titulo: 'Ainda sem vídeo' }],
    } });
    expect(saved.revision).toBe(1);
    expect(h.rows(TreinoModalidade)).toHaveLength(0);
    expect(h.rows(Treino)).toHaveLength(0);
    expect((await h.service.get('modalidade', id)).payload.treinos[0].titulo).toBe('Ainda sem vídeo');
    await expect(h.service.publish('modalidade', id, 1)).rejects.toBeInstanceOf(BadRequestException);
    expect(h.rows(WorkoutDraft)).toHaveLength(1);
  });
  it('mantém a versão publicada ao salvar e publica os vídeos juntos, com Free individual', async () => {
    const h = harness(), id = randomUUID(), first = lesson(), second = lesson();
    h.rows(TreinoModalidade).push({ id, nome: 'Original', ativo: true, updated_at: new Date(0) });
    h.rows(Treino).push({ ...first, modalidade_id: id });
    const editor = await h.service.get('modalidade', id);
    await h.service.save('modalidade', id, { ...editor, payload: {
      content: { nome: 'Editado', ativo: true }, treinos: [{ ...first, is_free: true }, second],
    } });
    expect(h.rows(TreinoModalidade)[0].nome).toBe('Original');
    expect(h.rows(Treino)).toHaveLength(1);
    await h.service.publish('modalidade', id, 1);
    expect(h.rows(TreinoModalidade)[0].nome).toBe('Editado');
    expect(h.rows(Treino)).toHaveLength(2);
    expect(h.rows(Treino).map(t => t.is_free)).toEqual([true, false]);
    expect(h.rows(WorkoutDraft)).toHaveLength(0);
  });
  it('rejeita revisões antigas sem sobrescrever o trabalho de outro editor', async () => {
    const h = harness(), id = randomUUID();
    const request = { revision: 0, baseVersion: 'new', payload: { content: { titulo: 'Treino', video_url: 'video' } } };
    await h.service.save('treino', id, request);
    await expect(h.service.save('treino', id, request)).rejects.toBeInstanceOf(ConflictException);
    await expect(h.service.publish('treino', id, 2)).rejects.toBeInstanceOf(ConflictException);
    expect(h.rows(Treino)).toHaveLength(0);
  });
  it('detecta alterações externas em um vídeo desde a abertura do editor', async () => {
    const h = harness(), id = randomUUID(), child = { ...lesson(), modalidade_id: id };
    h.rows(TreinoModalidade).push({ id, nome: 'Modalidade', updated_at: new Date(0) });
    h.rows(Treino).push(child);
    const editor = await h.service.get('modalidade', id);
    await h.service.save('modalidade', id, editor);
    h.rows(Treino)[0].titulo = 'Alterado por outro editor';
    await expect(h.service.publish('modalidade', id, 1)).rejects.toBeInstanceOf(ConflictException);
    expect(h.rows(Treino)[0].titulo).toBe('Alterado por outro editor');
  });
  it('desfaz a publicação inteira quando a gravação de um vídeo falha e mantém o rascunho', async () => {
    const h = harness(), id = randomUUID(), a = lesson(), b = lesson();
    await h.service.save('modalidade', id, { revision: 0, baseVersion: 'new', payload: { content: { nome: 'Nova' }, treinos: [a,b] } });
    h.failOn(b.id);
    await expect(h.service.publish('modalidade', id, 1)).rejects.toThrow('simulated write failure');
    expect(h.rows(TreinoModalidade)).toHaveLength(0);
    expect(h.rows(Treino)).toHaveLength(0);
    expect(h.rows(WorkoutDraft)).toHaveLength(1);
    expect(h.db.transaction).toHaveBeenLastCalledWith('SERIALIZABLE', expect.any(Function));
  });
  it('não permite reutilizar o ID de vídeo de outra modalidade', async () => {
    const h = harness(), id = randomUUID(), child = lesson();
    h.rows(Treino).push({ ...child, modalidade_id: randomUUID() });
    await h.service.save('modalidade', id, { revision: 0, baseVersion: 'new', payload: { content: { nome: 'Nova' }, treinos: [child] } });
    await expect(h.service.publish('modalidade', id, 1)).rejects.toBeInstanceOf(BadRequestException);
    expect(h.rows(TreinoModalidade)).toHaveLength(0);
  });
  it('retira um vídeo do catálogo só ao publicar e preserva seu ID no banco', async () => {
    const h = harness(), id = randomUUID(), a = lesson(), b = lesson();
    h.rows(TreinoModalidade).push({ id, nome: 'Modalidade', updated_at: new Date(0) });
    h.rows(Treino).push({ ...a, modalidade_id: id }, { ...b, modalidade_id: id });
    const editor = await h.service.get('modalidade', id);
    await h.service.save('modalidade', id, { ...editor, payload: { content: editor.payload.content, treinos: [a] } });
    expect(h.rows(Treino).every(t => t.ativa)).toBe(true);
    await h.service.publish('modalidade', id, 1);
    expect(h.rows(Treino).find(t => t.id === b.id).ativa).toBe(false);
    expect(h.rows(Treino)).toHaveLength(2);
  });
  it('publica treino avulso e descarta só o rascunho de uma nova edição', async () => {
    const h = harness(), id = randomUUID();
    await h.service.save('treino', id, { revision: 0, baseVersion: 'new', payload: { content: { titulo: 'Original', video_url: 'video', is_free: true } } });
    await h.service.publish('treino', id, 1);
    const editor = await h.service.get('treino', id);
    await h.service.save('treino', id, { ...editor, payload: { content: { ...editor.payload.content, titulo: 'Rascunho' } } });
    await h.service.discard('treino', id, 1);
    expect(h.rows(Treino)[0].titulo).toBe('Original');
    expect(h.rows(Treino)[0].is_free).toBe(true);
  });
});
