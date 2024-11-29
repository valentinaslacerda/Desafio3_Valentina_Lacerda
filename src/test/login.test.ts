import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Auth Service test', () => {
  it('Deve realizar login com email e senha válidos', async () => {
    const response = await request(app).post('/api/v1/login').send({
      email: 'admin@admin.com',
      password: '123456',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('Deve retornar erro ao tentar logar com email inválido', async () => {
    const response = await request(app).post('/api/v1/login').send({
      email: 'invalid-email',
      password: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'E-mail inválido.');
  });
  it('Deve retornar erro ao tentar logar com senha incorreta', async () => {
    const response = await request(app).post('/api/v1/login').send({
      email: 'admin@admin.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Senha incorreta');
  });

  it('Deve retornar erro ao tentar logar com usuário não existente', async () => {
    const response = await request(app).post('/api/v1/login').send({
      email: 'aaa@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Email inválido ou usuário não encontrado.'
    );
  });
});
