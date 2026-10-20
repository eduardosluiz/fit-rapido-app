import { Treino } from './entities/treino.entity';

/** A liberação de uma sessão nunca é herdada de outro uso do exercício. */
export function isFreeWorkout(treino: Partial<Treino>): boolean {
  if (treino.ativa !== true) return false;
  if (!treino.modalidade_id) return treino.is_free === true;
  const modality = treino.modalidade;
  if (!modality || !modality.ativo) return false;
  if (!modality.tem_nivelamento && treino.dia_semana == null) {
    return treino.is_free === true;
  }
  if (treino.dia_semana == null) return false;
  const level = modality.tem_nivelamento ? treino.nivel : 'geral';
  return modality.configuracao_dias?.[level]?.[String(treino.dia_semana)]?.is_free === true;
}
