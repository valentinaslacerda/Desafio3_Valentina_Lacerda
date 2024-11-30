import request from 'supertest';
import app from '../index';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../infra/config/auth';
import { usersRepository } from '../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../infra/data-source';
import { v4 } from 'uuid';

jest.mock('../domain/repositories/UserRepository', () => ({
  usersRepository: {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
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
  token = sign({ id: v4() }, JWT_SECRET, { expiresIn: '1h' });
});

afterEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  jest.clearAllMocks();
});

describe('Create User Route', () => {
  it('Deve criar um novo usuário com dados válidos', async () => {
    const newUser = {
      full_name: 'Usuario',
      email: 'test@test.com',
      password: '12345678',
    };

    (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (usersRepository.create as jest.Mock).mockReturnValue({
      full_name: newUser.full_name,
      email: newUser.email,
      password: 'hashedPassword',
    });

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    console.log('Resposta completa:', response.body);
    console.log('Status retornado:', response.status);

    expect(response.status).toBe(201);
    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: newUser.full_name,
        email: newUser.email,
        password: 'hashedPassword',
      })
    );
  });

  it('Deve retornar erro ao tentar criar usuário sem token', async () => {
    const newUser = {
      full_name: 'Teste Usuario',
      email: 'teste@teste.com',
      password: '12345678',
    };

    const response = await request(app).post('/api/v1/user').send(newUser);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      'message',
      'Você não está autenticado'
    );
  });

  it('Deve retornar erro ao tentar criar usuário com email já existente', async () => {
    const existingUser = {
      full_name: 'Usuario',
      email: 'test@test.com',
      password: '12345678',
    };

    (usersRepository.findOne as jest.Mock).mockResolvedValue(existingUser);

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(existingUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Usuário já existe');
  });

  it('Deve retornar erro ao criar usuário com email inválido', async () => {
    const newUser = {
      full_name: 'Usuário',
      email: 'email-invalido',
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'E-mail inválido.');
  });
});
