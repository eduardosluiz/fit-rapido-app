import { ReceitasController } from './receitas.controller';

describe('ReceitasController', () => {
  const receitasService = { findAll: jest.fn().mockResolvedValue([]) };
  const controller = new ReceitasController(
    receitasService as any,
    {} as any,
    {} as any,
  );

  beforeEach(() => receitasService.findAll.mockClear());

  it('does not exclude premium recipes when the premium filter is absent', async () => {
    await controller.findAll({});

    expect(receitasService.findAll.mock.calls[0][4]).toBeUndefined();
  });

  it('applies the premium filter when explicitly requested', async () => {
    await controller.findAll({}, undefined, undefined, undefined, undefined, 'true');

    expect(receitasService.findAll.mock.calls[0][4]).toBe(true);
  });
});
