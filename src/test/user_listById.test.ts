import { SelectUserByIdService } from '../application/services/user/SelectUserByIdService';
import { AppDataSource } from '../infra/data-source';
import User from '../domain/entities/User';

jest.mock('../infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
    }),
  },
}));

describe('SelectUserByIdService', () => {
  const selectUserByIdService = new SelectUserByIdService();
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

  it('Deve retornar o usuário com sucesso', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

    const response = await selectUserByIdService.execute({ id: '1' });

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      withDeleted: true,
    });
    expect(response).toEqual(mockUser);
  });

  it('Deve lançar erro quando o usuário não for encontrado', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(selectUserByIdService.execute({ id: '999' })).rejects.toThrow(
      'Usuário não encontrado'
    );
  });
});
