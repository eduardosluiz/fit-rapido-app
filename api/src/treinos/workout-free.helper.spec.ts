import { isFreeWorkout } from './workout-free.helper';

describe('liberação Free de treinos', () => {
  const modality: any = { ativo: true, tem_nivelamento: true, configuracao_dias: {
    iniciante: { '0': { is_free: true } }, avancado: { '0': { is_free: false } },
  } };
  const exercise: any = { ativa: true, modalidade_id: 'm', modalidade: modality, nivel: 'iniciante', dia_semana: 0 };
  it('exige liberação explícita no treino solto; não interpreta premium=false como gratuito', () => {
    expect(isFreeWorkout({ ativa: true, is_premium: false })).toBe(false);
    expect(isFreeWorkout({ ativa: true, is_free: true })).toBe(true);
    expect(isFreeWorkout({ ativa: false, is_free: true })).toBe(false);
  });
  it('isola a sessão por modalidade, nível e dia, ignorando a marcação individual', () => {
    expect(isFreeWorkout(exercise)).toBe(true);
    expect(isFreeWorkout({ ...exercise, nivel: 'avancado', is_free: true })).toBe(false);
    expect(isFreeWorkout({ ...exercise, dia_semana: 1 })).toBe(false);
    expect(isFreeWorkout({ ...exercise, modalidade: { ...modality, configuracao_dias: {} } })).toBe(false);
    expect(isFreeWorkout({ ...exercise, modalidade: { ...modality, ativo: false } })).toBe(false);
  });
  it('libera aulas sem dia apenas pela configuração da trilha e não altera sessões por dia', () => {
    const m: any = { ativo: true, tem_nivelamento: false, configuracao_dias: { acesso: { aulas: { is_free: true } } } };
    const lesson = { ...exercise, dia_semana: null, modalidade: m };
    expect(isFreeWorkout(lesson)).toBe(true);
    expect(isFreeWorkout({ ...lesson, ativa: false })).toBe(false);
    expect(isFreeWorkout({ ...lesson, modalidade: { ...m, ativo: false } })).toBe(false);
    expect(isFreeWorkout({ ...lesson, dia_semana: 0 })).toBe(false);
    m.configuracao_dias.acesso.aulas.is_free = false;
    expect(isFreeWorkout(lesson)).toBe(false);
  });
  it('usa geral para modalidade sem níveis e revoga o acesso quando desmarcado', () => {
    const m: any = { ativo: true, tem_nivelamento: false, configuracao_dias: { geral: { '0': { is_free: true } } } };
    expect(isFreeWorkout({ ...exercise, modalidade: m })).toBe(true);
    m.configuracao_dias.geral['0'].is_free = false;
    expect(isFreeWorkout({ ...exercise, modalidade: m })).toBe(false);
  });
});
