import request from 'supertest';
import app from '../index';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../infra/config/auth';
import { usersRepository } from '../domain/repositories/UserRepository';
import { AppDataSource } from '../infra/data-source';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../domain/repositories/UserRepository', () => ({
  usersRepository: {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findAndCount: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

let token: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  token = sign({ id: uuidv4() }, JWT_SECRET, { expiresIn: '1h' });
});

afterEach(async () => {
  jest.clearAllMocks();
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('List User Route', () => {
  it('Deve listar todos os usuários', async () => {
    const newUserInput = {
      full_name: 'Usuario',
      email: 'test@test.com',
      password: '12345678',
    };

    const newUser = {
      id: '123',
      full_name: newUserInput.full_name,
      email: newUserInput.email,
      createdAt: '2024-11-29T14:58:56.761Z',
      updatedAt: '2024-11-29T14:58:56.761Z',
    };

    (usersRepository.create as jest.Mock).mockReturnValue({
      ...newUserInput,
      password: 'hashedPassword',
    });

    (usersRepository.save as jest.Mock).mockResolvedValue(newUser);

    (usersRepository.findAndCount as jest.Mock).mockResolvedValue([
      [newUser],
      1,
    ]);

    const response = await request(app)
      .get('/api/v1/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
    expect(response.body.users[1]).toMatchObject({
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
    });
  });
});
