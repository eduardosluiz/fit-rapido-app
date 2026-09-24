import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { ConsultaIA } from '../ingredientes/entities/consulta-ia.entity';
import { SubstituicaoUsuario } from '../ingredientes/entities/substituicao-usuario.entity';

describe('exclusão solicitada pelo titular da conta', () => {
  it('remove apenas os vínculos do titular antes da conta, numa transação', async () => {
    const manager = { delete: jest.fn().mockResolvedValue({}) };
    const transaction = jest.fn(callback => callback(manager));
    const users = { findOne: jest.fn().mockResolvedValue({ id: 'owner' }), manager: { transaction } };
    const service = new AuthService(users as any, {} as any, {} as any);
    await service.deleteUser('owner');
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(manager.delete.mock.calls).toEqual([
      [SubstituicaoUsuario, { usuario_id: 'owner' }],
      [ConsultaIA, { usuario_id: 'owner' }],
      [User, { id: 'owner' }],
    ]);
  });
  it('não tenta remover vínculos se a conta não existe', async () => {
    const transaction = jest.fn();
    const service = new AuthService({ findOne: jest.fn().mockResolvedValue(null), manager: { transaction } } as any, {} as any, {} as any);
    await expect(service.deleteUser('missing')).rejects.toThrow('Usuário não encontrado');
    expect(transaction).not.toHaveBeenCalled();
  });
});
