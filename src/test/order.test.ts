import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';
import { generatePlate, generateValidCPF, generateValidEmail } from './utils';

let token: string;
let orderId: string;
let carId: string;
let clientId: string;

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

  carId = responseCar.body.id;

  const clientData = {
    name: 'Alice',
    birthday: '2000-01-01',
    cpf: generateValidCPF(),
    email: generateValidEmail(),
    phone: '1234567890',
  };

  const responseClient = await request(app)
    .post('/api/v1/client')
    .set('Authorization', `Bearer ${token}`)
    .send(clientData);

  clientId = responseClient.body.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Testa Serviços de Order', () => {
  /////////////////Create Car Tests
  it('Deve criar um pedido com sucesso', async () => {
    const order = {
      clientId,
      carId,
    };

    const response = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    orderId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body).not.toBeNull();
  });

  it('Não deve criar pedido sem id do cliente', async () => {
    const order = {
      carId,
    };

    const response = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'O campo clientId é obrigatório.' });
  });

  it('Não deve criar pedido sem id do carro', async () => {
    const order = {
      clientId,
    };

    const response = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'O campo carId é obrigatório.' });
  });

  it('Deve retornar erro quando não achar cliente do pedido', async () => {
    const order = {
      clientId: 'idInvalid',
      carId,
    };

    const response = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Cliente não encontrado' });
  });

  it('Deve retornar erro quando não achar carro do pedido', async () => {
    const order = {
      clientId,
      carId: 'idInvalid',
    };

    const response = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Carro não encontrado' });
  });

  it('Deve retornar erro quando tentar criar pedido com carro inativo', async () => {
    const carData = {
      plate: generatePlate(true),
      brand: 'Toyota',
      model: 'Audi',
      km: 20000,
      year: 2023,
      price: 100000,
      status: 'inativo',
      items: ['Airbag', 'ABS'],
    };
    const responseCar = await request(app)
      .post(`/api/v1/car`)
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    const id = responseCar.body.id;

    const order = {
      clientId,
      carId: id,
    };

    const response = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        'O carro selecionado não está ativo e não pode ser adicionado ao pedido.',
    });
  });

  ////////////Find Order By Id Tests
  it('Deve retornar ordem aberta', async () => {
    const response = await request(app)
      .get(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orderId);
  });

  it('Deve retornar erro ao procurar ordem que não existe', async () => {
    const response = await request(app)
      .get(`/api/v1/order/idInvalido`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Pedido nao encontrado',
    });
  });

  /////////Deve fazer update
  it('Deve atualizar ordem com sucesso', async () => {
    const response = await request(app)
      .put(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        cep: '59071-280',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', orderId);
    expect(response.body).toHaveProperty('cep', '59071280');
  });

  it('Deve retornar erro para ID inválido', async () => {
    const response = await request(app)
      .put('/api/v1/order/idInvalido')
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'Aprovado',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Pedido não encontrado',
    });
  });

  it('Deve retornar erro para CEP inválido', async () => {
    const response = await request(app)
      .put(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        cep: '12345',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'O campo CEP deve estar no formato 00000-000 ou 00000000.',
    });
  });

  it('Deve retornar erro para status inválido', async () => {
    const response = await request(app)
      .put(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'InvalidoStatus',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        'O campo status deve ser um dos seguintes valores: Aprovado, Cancelado.',
    });
  });

  it('Deve atualizar pedido de regiões que não são do Nordeste', async () => {
    const response = await request(app)
      .put(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        cep: '79070-564',
      });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'No momento não temos filiais nessa região',
    });
  });

  it('Deve cancelar pedido com sucesso', async () => {
    const response = await request(app)
      .put(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'Cancelado',
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Cancelado');
  });

  it('Não deve cancelar pedido cancelado', async () => {
    const response = await request(app)
      .put(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'Cancelado',
      });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Apenas pedidos "Aberto" podem ser cancelados.',
    });
  });

  ////////////////Delete Order Test
  it('Deve retornar erro ao tentar deletar um pedido que não está aberto', async () => {
    const response = await request(app)
      .delete(`/api/v1/order/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Apenas pedidos com status "Aberto" podem ser cancelados.',
    });
  });

  it('Deve retornar que o pedido não foi encontrado quando ele não existe no banco.', async () => {
    const response = await request(app)
      .delete(`/api/v1/order/invalidId`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Pedido não encontrado',
    });
  });

  it('Deve deletar pedido com sucesso', async () => {
    const order = {
      clientId,
      carId,
    };

    const res = await request(app)
      .post(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .send(order);

    const id = res.body.id;

    const response = await request(app)
      .delete(`/api/v1/order/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  ////////////List Client tests

  it('Deve retornar uma lista de pedidos com paginação', async () => {
    const response = await request(app)
      .get('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, pageSize: 2 });

    expect(response.status).toBe(200);
  });

  it('Deve filtrar pedidos pelo cpf', async () => {
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
      .post('/api/v1/car')
      .set('Authorization', `Bearer ${token}`)
      .send(carData);

    const carId = responseCar.body.id;

    const clientData = {
      name: 'Alice',
      birthday: '2000-01-01',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '1234567890',
    };

    const responseClient = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    const clientId = responseClient.body.id;
    const clientCPF = responseClient.body.cpf;

    const orderData = {
      clientId,
      carId,
    };

    await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);

    const response = await request(app)
      .get(`/api/v1/order`)
      .set('Authorization', `Bearer ${token}`)
      .query({ clientCpf: clientCPF });

    expect(response.status).toBe(200);
    expect(response.body.orders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          client: expect.objectContaining({
            id: `${clientId}`,
          }),
        }),
      ])
    );
  });

  it('Deve retornar pedidos deletados quando especificado', async () => {
    const response = await request(app)
      .get('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: 'Cancelado' });

    expect(response.status).toBe(200);

    const [orderCar] = response.body.orders;

    expect(orderCar.status).toBe('Cancelado');
  });
});
