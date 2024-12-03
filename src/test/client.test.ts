import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';
import { generateValidCPF, generateValidEmail } from './utils/utils';

let token: string;
let clientId: string;
let cpfExists: string;
let emailExists: string;
let deletedClient: string;
//let newCPF: string;
//let newEmail: string;

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
describe('Testes Para Client', () => {
  it('Deve criar um novo cliente', async () => {
    const clientData = {
      name: 'Alice',
      birthday: '1990-01-01',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '1234567890',
    };

    cpfExists = clientData.cpf;
    emailExists = clientData.email;

    const response = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    clientId = response.body.id;
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(clientData.name);
    expect(response.body.email).toBe(clientData.email);
  });

  it('Deve retornar um erro quando cpf é inválido', async () => {
    const clientData = {
      name: 'Alice ',
      birthday: '1990-01-01',
      cpf: '1234',
      email: generateValidEmail(),
      phone: '1234567890',
    };

    const response = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid cpf');
  });

  it('Deve retornar um erro quando cpf já existir', async () => {
    const clientData = {
      name: 'Bob',
      birthday: '2000-01-01',
      cpf: cpfExists,
      email: generateValidEmail(),
      phone: '1234567890',
    };

    const response = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Client creation failed: CPF/email already exists.'
    );
  });

  it('Deve retornar um erro quando formato de email é inválido', async () => {
    const clientData = {
      name: 'Alice ',
      birthday: '1990-01-01',
      cpf: generateValidCPF(),
      email: 'invalid-email',
      phone: '1234567890',
    };

    const response = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);
    console.log(response.body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email');
  });

  ///////////////////Find By ID
  it('Deve retornar um cliente existente pelo ID', async () => {
    const response = await request(app)
      .get(`/api/v1/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', clientId);
    expect(response.body.name).toBe('Alice');
    expect(response.body.email).toBe(emailExists);
  });

  it('Deve retornar 404 para um ID inexistente', async () => {
    const response = await request(app)
      .get('/api/v1/client/invalidId')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Client not found');
  });

  ////////////////Update client
  it('Não deve atualizar cliente com CPF inválido', async () => {
    const updatedData = {
      name: 'Alice Atualizada',
      birthday: '1990-02-01',
      cpf: '1890',
      email: 'alice.updated@test.com',
      phone: '0987654321',
    };

    const response = await request(app)
      .patch(`/api/v1/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid cpf');
  });

  it('Não deve atualizar cliente com email inválido', async () => {
    const updatedData = {
      name: 'Alice Atualizada',
      birthday: '1990-02-01',
      cpf: generateValidCPF(),
      email: 'invalidEmail',
      phone: '0987654321',
    };

    const response = await request(app)
      .patch(`/api/v1/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email');
  });

  it('Deve retornar erro 404 quando o cliente não for encontrado', async () => {
    const updatedData = {
      name: 'Cliente Inexistente',
      birthday: '1990-03-01',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '1231231234',
    };

    const invalidClientId = 'nonexistentClientId';

    const response = await request(app)
      .patch(`/api/v1/client/${invalidClientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'Client not found or is already deleted'
    );
  });

  it('Não deve atualizar cliente com CPF/email já existentes', async () => {
    const secondClientData = {
      name: 'João',
      birthday: '1995-07-01',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '0987654321',
    };

    await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(secondClientData);

    const secondClientCPF = secondClientData.cpf;

    const updatedData = {
      name: 'Alice Atualizada',
      birthday: '1990-02-01',
      cpf: secondClientCPF,
      email: 'aliceupdated@test.com',
      phone: '0987654321',
    };

    const updateResponse = await request(app)
      .patch(`/api/v1/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.message).toBe(
      'Client creation failed: CPF already exists.'
    );
  });

  it('Deve atualizar um cliente com dados válidos', async () => {
    const updatedData = {
      name: 'Alice Atualizada',
      birthday: '1990-02-01',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '0987654321',
    };
    //newCPF = updatedData.cpf;
    //newEmail = updatedData.email;

    const response = await request(app)
      .patch(`/api/v1/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.birthday).toBe(updatedData.birthday);
    expect(response.body.cpf).toBe(updatedData.cpf);
    expect(response.body.email).toBe(updatedData.email);
    expect(response.body.phone).toBe(updatedData.phone);
  });

  /////////////////////////////Delete Client
  it('Deve excluir um cliente com sucesso', async () => {
    const clientData = {
      name: 'Carlos Scienz',
      birthday: '1992-01-15',
      cpf: generateValidCPF(),
      email: generateValidEmail(),
      phone: '1234567890',
    };

    const createResponse = await request(app)
      .post('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    deletedClient = createResponse.body.id;

    const deleteResponse = await request(app)
      .delete(`/api/v1/client/${deletedClient}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Client deleted successfully');
  });

  it('Não deve excluir um cliente que já foi excluído', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/v1/client/${deletedClient}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.body.message).toBe(
      'Client not found or is already deleted'
    );
  });
  it('Não deve excluir um cliente que não existe', async () => {
    const nonExistentId = 'falseId';
    const deleteResponse = await request(app)
      .delete(`/api/v1/client/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.body.message).toBe(
      'Client not found or is already deleted'
    );
  });

  ////////////List Client tests

  it('Deve retornar uma lista de clientes com paginação', async () => {
    const response = await request(app)
      .get('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, pageSize: 2 });

    expect(response.status).toBe(200);
  });

  it('Deve filtrar clientes pelo nome', async () => {
    const response = await request(app)
      .get('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'Alice Atualizada' });

    expect(response.status).toBe(200);

    const [client] = response.body.clients;

    expect(client.name).toBe('Alice Atualizada');
  });

  it('Deve retornar clientes deletados quando especificado', async () => {
    const response = await request(app)
      .get('/api/v1/client')
      .set('Authorization', `Bearer ${token}`)
      .query({ isDeleted: true });

    expect(response.status).toBe(200);

    const [client] = response.body.clients;

    expect(client.deletedAt).not.toBeNull();
  });
});
