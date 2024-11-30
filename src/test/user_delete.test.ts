import { DeleteUserService } from '../application/services/user/DeleteUserService';
import { AppDataSource } from '../infra/data-source';
import User from '../domain/entities/User';

jest.mock('../infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      softDelete: jest.fn(),
    }),
  },
}));

describe('DeleteUserService', () => {
  const deleteUserService = new DeleteUserService();
  const mockRepository = AppDataSource.getRepository(User);
  const mockUser = {
    id: '1',
    full_name: 'User Name',
    email: 'user@test.com',
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve excluir o usuário com sucesso', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

    (mockRepository.softDelete as jest.Mock).mockResolvedValue({});

    const response = await deleteUserService.execute({ id: '1' });

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      withDeleted: true,
    });
    expect(mockRepository.softDelete).toHaveBeenCalledWith('1');
    expect(response).toEqual({ message: 'Usuário excluído com sucesso!' });
  });

  it('Deve lançar erro quando o ID não for encontrado', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(deleteUserService.execute({ id: '999' })).rejects.toThrow(
      'ID do Usuário não encontrado'
    );
  });

  it('Deve lançar erro quando o usuário já foi excluído', async () => {
    const deletedUser = { ...mockUser, deletedAt: new Date() };
    (mockRepository.findOne as jest.Mock).mockResolvedValue(deletedUser);

    await expect(deleteUserService.execute({ id: '1' })).rejects.toThrow(
      'Usuário já foi excluído'
    );
  });
});
