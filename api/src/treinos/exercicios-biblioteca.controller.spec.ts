import { ExerciciosBibliotecaController } from './exercicios-biblioteca.controller';

describe('ExerciciosBibliotecaController', () => {
  const repository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  let controller: ExerciciosBibliotecaController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ExerciciosBibliotecaController(repository as any);
  });

  it('returns the existing record when the same storage URL is confirmed again', async () => {
    const existing = {
      id: 'existing-id',
      nome: 'Agachamento',
      video_url: 'https://storage.example/exercicio.mp4',
    };
    repository.findOne.mockResolvedValue(existing);

    await expect(controller.create({ ...existing })).resolves.toBe(existing);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('creates a record when the storage URL is new', async () => {
    const input = {
      nome: 'Agachamento',
      video_url: 'https://storage.example/novo.mp4',
    };
    const created = { id: 'new-id', ...input };
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    await expect(controller.create(input)).resolves.toBe(created);
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(repository.save).toHaveBeenCalledWith(created);
  });

  it('detects an existing video by normalized, case-insensitive name', async () => {
    const existing = { id: 'existing-id', nome: 'Agachamento' };
    repository.findOne.mockResolvedValue(existing);

    await expect(controller.checkDuplicateName('  Agachamento  ')).resolves.toEqual({
      exists: true,
      item: existing,
    });
    expect(repository.findOne).toHaveBeenCalled();
  });
});
