import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createHash, randomUUID } from 'crypto';
import { WorkoutDraft } from './entities/workout-draft.entity';
import { Treino } from './entities/treino.entity';
import { TreinoModalidade } from './entities/treino-modalidade.entity';
import { CategoriaTreino } from './entities/categoria-treino.entity';
import { CreateTreinoDto } from './dto/treino.dto';
import { CreateTreinoModalidadeDto } from './dto/treino-modalidade.dto';

@Injectable()
export class WorkoutDraftsService {
  constructor(private readonly db: DataSource) {}

  private type(type: string) {
    if (!['modalidade', 'treino'].includes(type)) throw new BadRequestException('Tipo de conteúdo inválido.');
  }

  private async snapshot(em: EntityManager, type: string, id: string) {
    const content: any = type === 'modalidade'
      ? await em.findOne(TreinoModalidade, { where: { id } })
      : await em.findOne(Treino, { where: { id }, relations: ['categorias'], loadEagerRelations: false });
    if (type === 'treino' && content?.modalidade_id) {
      throw new BadRequestException('Edite este exercício dentro da modalidade para publicar o conjunto.');
    }
    const children = type === 'modalidade'
      ? await em.find(Treino, { where: { modalidade_id: id }, order: { id: 'ASC' }, loadEagerRelations: false }) : [];
    // Ratings can change independently of editorial work. Category order is immaterial.
    const editorial = (item: any) => {
      const { avaliacao, total_avaliacoes, categorias, ...fields } = item;
      return { ...fields, categoria_ids: categorias?.map(c => c.id).sort() };
    };
    const version = content ? createHash('sha256').update(JSON.stringify({ content: editorial(content), children: children.map(editorial) })).digest('hex') : 'new';
    return { content, children, version };
  }

  private view(draft: WorkoutDraft) {
    const { _baseVersion, ...payload } = draft.payload;
    return { id: draft.content_id, revision: draft.revision, baseVersion: _baseVersion, payload, hasDraft: true,
      published: !!draft.base_published_updated_at, updated_at: draft.updated_at };
  }

  async list(type: string) {
    this.type(type);
    // Only small summaries are returned; never load video arrays for the list.
    return this.db.getRepository(WorkoutDraft).createQueryBuilder('d')
      .select('d.content_id', 'id').addSelect('d.revision', 'revision')
      .addSelect('d.updated_at', 'updated_at')
      .addSelect('d.base_published_updated_at IS NOT NULL', 'published')
      .addSelect("COALESCE(d.payload->'content'->>'nome', d.payload->'content'->>'titulo', 'Sem título')", 'title')
      .where('d.content_type = :type', { type }).orderBy('d.updated_at', 'DESC').getRawMany();
  }

  async get(type: string, id: string) {
    this.type(type);
    return this.db.transaction('REPEATABLE READ', async em => {
      const draft = await em.findOneBy(WorkoutDraft, { content_type: type, content_id: id });
      if (draft) return this.view(draft);
      const snapshot = await this.snapshot(em, type, id);
      if (!snapshot.content) throw new NotFoundException('Conteúdo não encontrado.');
      const content = { ...snapshot.content };
      if (type === 'treino') content.categoria_ids = content.categorias?.map(c => c.id) || [];
      return { id, revision: 0, baseVersion: snapshot.version, hasDraft: false, published: true,
        payload: { content, treinos: snapshot.children.filter(t => t.ativa) } };
    });
  }

  private async lock(em: EntityManager, type: string, id: string) {
    await em.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`workout-draft:${type}:${id}`]);
  }

  private async clean(dto: any, data: any, publishing: boolean) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new BadRequestException('Conteúdo inválido.');
    const instance = plainToInstance(dto, data);
    const errors = await validate(instance, { whitelist: true, skipMissingProperties: !publishing });
    if (errors.length) throw new BadRequestException(`Confira os campos: ${errors.map(e => e.property).join(', ')}.`);
    return { ...instance } as any;
  }

  private async payload(type: string, input: any, publishing: boolean) {
    const content = await this.clean(type === 'modalidade' ? CreateTreinoModalidadeDto : CreateTreinoDto, input?.content, publishing);
    if (type === 'treino' && content.modalidade_id) throw new BadRequestException('Use o editor da modalidade para este conteúdo.');
    if (publishing && !(type === 'modalidade' ? content.nome : content.titulo)?.trim()) {
      throw new BadRequestException('Informe o título antes de publicar.');
    }
    const treinos: any[] = [];
    if (publishing && type === 'treino') {
      const exercises = (content.exercicios_detalhados || []).filter(ex => ex && Object.values(ex).some(value => value !== '' && value != null));
      content.exercicios_detalhados = exercises;
      if (!content.video_url?.trim() && !exercises.length) throw new BadRequestException('Adicione um vídeo ou exercício antes de publicar.');
      if (exercises.some(ex => !ex?.nome?.trim())) throw new BadRequestException('Preencha o nome de cada exercício antes de publicar.');
    }
    if (type === 'modalidade') {
      if (!Array.isArray(input.treinos)) throw new BadRequestException('Lista de vídeos inválida.');
      if (publishing && !input.treinos.length) throw new BadRequestException('Adicione pelo menos um vídeo antes de publicar.');
      const ids = new Set<string>();
      for (const raw of input.treinos) {
        const data = await this.clean(CreateTreinoDto, raw, publishing);
        const id = raw.id || randomUUID();
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || ids.has(id)) {
          throw new BadRequestException('Identificador de vídeo inválido ou repetido.');
        }
        ids.add(id);
        if (publishing && (!data.titulo?.trim() || !data.video_url?.trim())) {
          throw new BadRequestException('Cada vídeo precisa de título e vídeo de execução antes de publicar.');
        }
        treinos.push({ ...data, id });
      }
    }
    return { content, treinos };
  }

  async save(type: string, id: string, request: { revision: number; baseVersion: string; payload: any }) {
    this.type(type);
    const payload = await this.payload(type, request.payload, false);
    return this.db.transaction(async em => {
      await this.lock(em, type, id);
      const draft = await em.findOneBy(WorkoutDraft, { content_type: type, content_id: id });
      if ((draft?.revision || 0) !== request.revision) throw new ConflictException('O rascunho mudou. Reabra o editor antes de salvar.');
      if (draft && draft.payload._baseVersion !== request.baseVersion) throw new ConflictException('Uma nova edição foi iniciada. Reabra o editor.');
      const snapshot = await this.snapshot(em, type, id);
      const baseVersion = draft?.payload._baseVersion || request.baseVersion;
      if (!draft && snapshot.version !== baseVersion) throw new ConflictException('O conteúdo publicado mudou. Reabra o editor.');
      const saved = await em.save(WorkoutDraft, {
        ...draft, content_type: type, content_id: id, revision: request.revision + 1,
        payload: { ...payload, _baseVersion: baseVersion },
        base_published_updated_at: draft ? draft.base_published_updated_at : snapshot.content?.updated_at || null,
      });
      return this.view(saved);
    });
  }

  private async saveTreino(em: EntityManager, id: string, data: any, existing?: Treino) {
    const { categoria_ids, ...fields } = data;
    if (existing && categoria_ids === undefined && Object.keys(fields).every(key => JSON.stringify(existing[key]) === JSON.stringify(fields[key]))) {
      return existing;
    }
    // Keep entity-only fields (ratings, timestamps) out of client input.
    const treino = em.create(Treino, { ...existing, ...fields, id });
    if (categoria_ids !== undefined) {
      const ids = [...new Set<string>(categoria_ids)];
      const categorias = ids.length ? await em.findBy(CategoriaTreino, { id: In(ids) }) : [];
      if (categorias.length !== ids.length) throw new BadRequestException('Uma categoria foi removida. Revise o treino.');
      treino.categorias = categorias;
    }
    return em.save(Treino, treino);
  }

  async discard(type: string, id: string, revision: number) {
    this.type(type);
    return this.db.transaction(async em => {
      await this.lock(em, type, id);
      const draft = await em.findOneBy(WorkoutDraft, { content_type: type, content_id: id });
      if (!draft || draft.revision !== revision) throw new ConflictException('O rascunho mudou. Reabra o editor.');
      await em.delete(WorkoutDraft, { id: draft.id });
      return { discarded: true };
    });
  }

  async publish(type: string, id: string, revision: number) {
    this.type(type);
    try {
      return await this.db.transaction('SERIALIZABLE', async em => {
        await this.lock(em, type, id);
        const draft = await em.findOneBy(WorkoutDraft, { content_type: type, content_id: id });
        if (!draft || draft.revision !== revision) throw new ConflictException('O rascunho mudou ou já foi publicado. Reabra o editor.');
        const snapshot = await this.snapshot(em, type, id);
        if (snapshot.version !== draft.payload._baseVersion) throw new ConflictException('O conteúdo publicado mudou desde o início deste rascunho. Nenhum dado foi sobrescrito.');
        const payload = await this.payload(type, draft.payload, true);
        if (type === 'modalidade') {
          const { slug, ...fields } = payload.content;
          await em.save(TreinoModalidade, em.create(TreinoModalidade, { ...snapshot.content, ...fields, id }));
          const existing = new Map(snapshot.children.map(t => [t.id, t]));
          for (const child of payload.treinos) {
            if (!existing.has(child.id) && await em.existsBy(Treino, { id: child.id })) {
              throw new BadRequestException('Um vídeo pertence a outro conteúdo.');
            }
            await this.saveTreino(em, child.id, { ...child, modalidade_id: id }, existing.get(child.id));
            existing.delete(child.id);
          }
          // Preserve IDs referenced by favorites/history; remove from the visible catalog only.
          for (const child of existing.values()) {
            if (child.ativa) await em.update(Treino, child.id, { ativa: false });
          }
        } else {
          await this.saveTreino(em, id, { ...payload.content, modalidade_id: null }, snapshot.content);
        }
        await em.delete(WorkoutDraft, { id: draft.id });
        return { id, published: true };
      });
    } catch (error) {
      if (error.code === '40001' || error.code === '23505') throw new ConflictException('Houve uma alteração concorrente ou um nome já existe. Revise e tente novamente.');
      throw error;
    }
  }
}
