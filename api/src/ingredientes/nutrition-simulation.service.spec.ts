import { applyNutritionDeltas, NutritionSimulationService, validNutrients } from './nutrition-simulation.service';

const macros = (calorias: number) => ({ calorias, proteinas: 10, carboidratos: 20, gorduras: 5, fibras: 2, sodio: 10 });
describe('Read-only nutrition simulation', () => {
  it('applies whole-recipe differences per serving, once', () => {
    expect(applyNutritionDeltas(macros(200), [{ original: macros(100), substituto: macros(180) }], 4).calorias).toBe(220);
  });
  it('rejects invalid numbers, missing nutrients and contradictory totals', () => {
    expect(validNutrients({ ...macros(100), calorias: NaN })).toBe(false);
    expect(validNutrients({ calorias: 100 })).toBe(false);
    expect(() => applyNutritionDeltas(macros(20), [{ original: macros(100), substituto: macros(10) }], 1)).toThrow();
    expect(() => applyNutritionDeltas(macros(20), [], 0)).toThrow();
  });
  const setup = () => {
    const recipe = { id: 'recipe', ingredientes: ['2 colheres de farinha'], porcoes: 4, ...macros(200) };
    const recipes = { findOne: jest.fn().mockResolvedValue(recipe), save: jest.fn(), update: jest.fn() };
    const service = new NutritionSimulationService(recipes as any, { find: async () => [] } as any, { findOne: async () => null } as any, { get: () => undefined } as any, { findById: async () => ({ role: 'admin' }) } as any);
    const create = jest.fn();
    (service as any).client = { chat: { completions: { create } } };
    return { service, create, recipes };
  };
  it('asks for clarification without fabricated numbers or writes', async () => {
    const { service, create, recipes } = setup();
    create.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ pergunta: 'Qual farinha e tamanho da colher?', trocas: [] }) } }] });
    const result = await service.simulate('user', { receita_id: 'recipe', trocas: [{ indice: 0, substituto: 'aveia' }] });
    expect(result.status).toBe('esclarecer');
    expect((result as any).macrosModificado).toBeUndefined();
    expect(recipes.save).not.toHaveBeenCalled();
    expect(recipes.update).not.toHaveBeenCalled();
  });
  it('validates and caches estimates without altering stored recipes', async () => {
    const { service, create, recipes } = setup();
    create.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ pergunta: null, premissas: ['2 colheres de sopa rasas = aproximadamente 20g'], trocas: [{ indice: 0, original: macros(100), substituto: macros(180) }] }) } }] });
    const dto = { receita_id: 'recipe', trocas: [{ indice: 0, substituto: 'aveia' }], esclarecimento: 'Farinha de trigo, colheres de sopa rasas' };
    const result: any = await service.simulate('user', dto);
    expect(result.macrosModificado.calorias).toBe(220);
    expect(result.estimado).toBe(true);
    await service.simulate('user', dto);
    expect(create).toHaveBeenCalledTimes(1);
    expect(recipes.save).not.toHaveBeenCalled();
  });
  it('does not return partial calculations if AI omits a requested swap', async () => {
    const { service, create } = setup();
    create.mockResolvedValue({ choices: [{ message: { content: '{"trocas":[],"premissas":[]}' } }] });
    expect((await service.simulate('user', { receita_id: 'recipe', trocas: [{ indice: 0, substituto: 'aveia' }] })).status).toBe('indisponivel');
  });
});
