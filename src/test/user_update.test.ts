import { UpdateUserService } from '../application/services/user/UpdateUserService';
import { compare, hash } from 'bcryptjs';
import { AppDataSource } from '../infra/data-source';
import User from '../domain/entities/User';

jest.mock('../infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      save: jest.fn(),
    }),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UpdateUserService', () => {
  const updateUserService = new UpdateUserService();
  const mockRepository = AppDataSource.getRepository(User);
  const mockUser = {
    id: '1',
    full_name: 'Old Name',
    email: 'oldemail@test.com',
    password: 'hashedPassword',
    deletedAt: null,
    updatedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve atualizar o usuário com sucesso', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);
    (hash as jest.Mock).mockResolvedValue('newHashedPassword');

    console.log('Antes de chamar updateUserService.execute');
    const response = await updateUserService.execute({
      id: '1',
      full_name: 'New Name',
      email: 'us@test.com',
      password: '12345678',
      newPassword: 'newPassword',
    });
    console.log('Resposta recebida:', response);

    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(compare).toHaveBeenCalledWith('12345678', 'hashedPassword');
    expect(hash).toHaveBeenCalledWith('newPassword', 8);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'New Name',
        email: 'us@test.com',
        password: 'newHashedPassword',
      })
    );
    expect(response).toEqual({
      message: 'Registro atualizado com sucesso',
    });
  });

  it('Deve lançar erro quando o ID não for preenchido', async () => {
    await expect(
      updateUserService.execute({
        id: '',
        full_name: 'New Name',
        email: 'newemail@test.com',
        password: '12345678',
        newPassword: 'newPassword',
      })
    ).rejects.toThrow('ID não preenchido');
  });

  it('Deve lançar erro quando a senha atual não for preenchida', async () => {
    await expect(
      updateUserService.execute({
        id: '1',
        full_name: 'New Name',
        email: 'newemail@test.com',
        password: '',
        newPassword: 'newPassword',
      })
    ).rejects.toThrow('Senha atual não preenchida');
  });

  it('Deve lançar erro quando o usuário não existir', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      updateUserService.execute({
        id: '1',
        full_name: 'New Name',
        email: 'newemail@test.com',
        password: '12345678',
        newPassword: 'newPassword',
      })
    ).rejects.toThrow('Usuário não existe');
  });

  it('Deve lançar erro ao tentar usar um email já existente', async () => {
    (mockRepository.findOne as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ id: '2', email: 'newemail@test.com' });

    await expect(
      updateUserService.execute({
        id: '1',
        full_name: 'New Name',
        email: 'newemail@test.com',
        password: '12345678',
        newPassword: 'newPassword',
      })
    ).rejects.toThrow('Email já está em uso');
  });

  it('Deve lançar erro ao tentar atualizar um usuário excluído', async () => {
    const deletedUser = { ...mockUser, deletedAt: new Date() };
    (mockRepository.findOne as jest.Mock).mockResolvedValue(deletedUser);

    await expect(
      updateUserService.execute({
        id: '1',
        full_name: 'New Name',
        email: 'newemail@test.com',
        password: '12345678',
        newPassword: 'newPassword',
      })
    ).rejects.toThrow('Não é possível atualizar um usuário excluído');
  });

  it('Deve lançar erro quando a senha atual for incorreta', async () => {
    (mockRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      updateUserService.execute({
        id: '1',
        full_name: 'New Name',
        email: 'newemail@test.com',
        password: 'wrongPassword',
        newPassword: 'newPassword',
      })
    ).rejects.toThrow('Senha atual incorreta');
  });
});
