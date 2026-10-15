type ModalityOrder = { nome?: string; ordem_modalidade?: number };

export function modalityPosition(modality: ModalityOrder): number {
  if (Number(modality.ordem_modalidade) > 0) return Number(modality.ordem_modalidade);
  const name = (modality.nome || '').trim().toLocaleLowerCase('pt-BR');
  return ({ 'sua jornada': 1, academia: 2, 'em casa': 3 } as Record<string, number>)[name] ?? 999;
}

export function compareModalities(a: ModalityOrder, b: ModalityOrder): number {
  return modalityPosition(a) - modalityPosition(b) || (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
}
