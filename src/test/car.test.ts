import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';
import { generatePlate } from './utils';

let token: string;
let existsPlate: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const loginData = {
    email: 'admin@admin.com',
    password: '123456',
  };

  const response = await request(app).post('/api/v1/login').send(loginData);

  token = response.body.token;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('POST /api/v1/car', () => {
  it('Deve criar um carro com sucesso', async () => {
    const carData = {
      plate: generatePlate(true),
      brand: 'Volkswagen',
      model: 'Fusca',
      km: 20000,
      year: 2020,
      price: 90000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };

    const response = await request(app)
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    existsPlate = carData.plate;
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('Deve retornar erro ao tentar criar um carro com placa já existente', async () => {
    const carData = {
      plate: existsPlate,
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: 90000,
      status: 'ativo',
      items: ['Airbag', 'Ar-condicionado'],
    };

    const response = await request(app)
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Já existe um carro no sistema com a placa informada.',
    });
  });

  it('Deve retornar erro ao tentar criar um carro com placa inválida', async () => {
    const carData = {
      plate: 'INVALIDA',
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: 90000,
      status: 'ativo',
      items: ['Airbag', 'Ar-condicionado'],
    };

    const response = await request(app)
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Placa inválida.' });
  });

  it('Deve retornar erro ao tentar criar um carro com status inválido', async () => {
    const carData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: 90000,
      status: 'vendido',
      items: ['Airbag', 'ABS'],
    };

    const response = await request(app)
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        "O status do carro deve ser um dos seguintes: 'ativo' ou 'inativo'.",
    });
  });

  it('Deve retornar erro ao tentar criar um carro com preço negativo', async () => {
    const carData = {
      plate: 'ABC1234',
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: -1000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };

    const response = await request(app)
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'O preço do carro não pode ser negativa.',
    });
  });
});
