import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';
import {
  generatePlate,
  generateValidCPF,
  generateValidEmail,
} from './utils/utils';
import { CreateCarDTO } from '../http/dtos/CreateCar.dto';

let token: string;
let existsPlate: string;
let carId: string;
let carPlate: string;

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

describe('Testa Serviços de Car', () => {
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
    carId = response.body.id;
    carPlate = response.body.plate;
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

  ///////////Show Car Tests
  it('Deve retornar carro buscado por id existente', async () => {
    const response = await request(app)
      .get(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(carId);
  });

  it('Deve retornar 400 para carro não encontrado', async () => {
    const response = await request(app)
      .get(`/api/v1/car/Invalid`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Carro não encontrado.' });
  });

  /////////////UPDATE Car Tests
  it('Deve retornar erro quando a quilometragem do carro for negativa', async () => {
    const newCarData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Corolla',
      km: -20000,
      year: 2020,
      price: 1000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'A quilometragem do carro não pode ser negativa.',
    });
  });

  it('Deve retornar erro quando o preço do carro for negativo', async () => {
    const newCarData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: -1000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'O preço do carro não pode ser negativa.',
    });
  });

  it('Deve retornar erro quando o carro tiver mais de 11 anos.', async () => {
    const newCarData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2000,
      price: 1000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'O carro não pode ter mais de 11 anos.',
    });
  });

  it('Deve retornar erro quando status do carro for errado.', async () => {
    const newCarData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: 1000,
      status: 'vendido',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        "O status do carro deve ser um dos seguintes: 'ativo' ou 'inativo'.",
    });
  });

  it('Deve retornar erro quando placa for inválida.', async () => {
    const newCarData = {
      plate: '11afr',
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: 1000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Placa inválida.',
    });
  });

  it('Deve retornar erro quando já existe um carro no sistema com a placa informada.', async () => {
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

    await request(app)
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    const plate = carData.plate;

    const newCarData = {
      plate: plate,
      brand: 'Toyota',
      model: 'Corolla',
      km: 20000,
      year: 2020,
      price: 1000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Já existe outro carro no sistema com a placa informada.',
    });
  });

  it('Deve atualizar carro com sucesso', async () => {
    const newCarData = {
      plate: carPlate,
      brand: 'Toyota',
      model: 'Audi',
      km: 20000,
      year: 2023,
      price: 100000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const response = await request(app)
      .patch(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newCarData);

    expect(response.status).toBe(204);
  });

  ////////////Delete Car Tests
  it('Deve retornar carro não encontrado quando não é encontrado no banco', async () => {
    const response = await request(app)
      .delete(`/api/v1/car/INVALID`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Carro não encontrado.',
    });
  });

  it('Deve retornar erro quando tentar excluir um carro com pedido em aberto', async () => {
    const carData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Audi',
      km: 20000,
      year: 2023,
      price: 100000,
      status: 'ativo',
      items: ['Airbag', 'ABS'],
    };
    const responseCar = await request(app)
      .post(`/api/v1/car`)
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    const carID = responseCar.body.id;

    const clientData = {
      name: 'Alice',
      birthday: '1990-01-01',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '1234567890',
    };

    const responseClient = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    const clientID = responseClient.body.id;

    const order = {
      clientId: clientID,
      carId: carID,
    };

    await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    const response = await request(app)
      .delete(`/api/v1/car/${carID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'O carro não pode ser excluído pois tem pedidos em aberto.',
    });
  });

  it('Deve deletar carro com sucesso', async () => {
    const response = await request(app)
      .delete(`/api/v1/car/${carId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  //////////////////////List Car tests
  it('Deve retornar uma lista de carros com paginação', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, limit: 2 });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });

  it('Deve filtrar carros por marca', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .query({ brand: 'Toyota' });

    expect(response.status).toBe(200);
    response.body.data.forEach((car: CreateCarDTO) => {
      expect(car.brand).toBe('Toyota');
    });
  });

  it('Deve filtrar carros por status', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: 'ativo' });

    expect(response.status).toBe(200);
    response.body.data.forEach((car: CreateCarDTO) => {
      expect(car.status).toBe('ativo');
    });
  });

  it('Deve retornar 204 quando nenhum carro for encontrado', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .query({ brand: 'MarcaInexistente' });

    expect(response.status).toBe(204);
  });

  it('Deve filtrar carros por intervalo de ano', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .query({ fromYear: 2015, untilYear: 2020 });

    expect(response.status).toBe(200);
    response.body.data.forEach((car: CreateCarDTO) => {
      expect(car.year).toBeGreaterThanOrEqual(2015);
      expect(car.year).toBeLessThanOrEqual(2020);
    });
  });

  it('Deve ordenar os carros por preço em ordem decrescente', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .query({ orderBy: 'price', orderDirection: 'DESC' });

    expect(response.status).toBe(200);
    const { data } = response.body;
    for (let i = 1; i < data.length; i++) {
      const currentPrice = parseFloat(data[i - 1].price);
      const nextPrice = parseFloat(data[i].price);
      expect(currentPrice).toBeGreaterThanOrEqual(nextPrice);
    }
  });
});
