import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';
import { generateValidEmail } from './utils';

let token: string;
let userId: string;
let emailExists: string;

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

describe('Testes para Serviços de User', () => {
  ////////////////Create User Tests
  it('Deve criar um novo usuário com dados válidos', async () => {
    const user = {
      full_name: 'Usuario',
      email: generateValidEmail(),
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    userId = response.body.id;
    emailExists = response.body.email;
    expect(response.status).toBe(201);
  });

  it('Não deve criar um novo usuário sem dado de email', async () => {
    const user = {
      full_name: 'Usuario',
      email: undefined,
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campo vazio: email');
  });

  it('Não deve criar um novo usuário sem dado de nome', async () => {
    const user = {
      full_name: undefined,
      email: generateValidEmail(),
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campo vazio: nome completo');
  });

  it('Não deve criar um novo usuário sem dado de senha', async () => {
    const user = {
      full_name: 'Usuario',
      email: generateValidEmail(),
      password: undefined,
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campo vazio: senha');
  });

  it('Não deve criar um novo usuário com dado de email inválido', async () => {
    const user = {
      full_name: 'Usuario',
      email: 'invalidEmail',
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('E-mail inválido.');
  });

  it('Não deve criar o mesmo usuário', async () => {
    const user = {
      full_name: 'Usuario',
      email: emailExists,
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário já existe');
  });

  /////////Find By Id Tests
  it('Deve retornar usuário buscado', async () => {
    const response = await request(app)
      .get(`/api/v1/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it('Deve retornar que usuário buscado buscado não existe', async () => {
    const response = await request(app)
      .get('/api/v1/user/idInvalido')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Usuário não encontrado');
  });

  ////////////////Update User Tests
  it('Deve atualizar user com sucesso', async () => {
    const newUser = {
      full_name: 'New User',
      password: '12345678',
    };

    const response = await request(app)
      .patch(`/api/v1/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(response.status).toBe(200);
  });

  it('Não deve atualizar user sem colocar senha atual', async () => {
    const newUser = {
      full_name: 'New User',
    };

    const response = await request(app)
      .patch(`/api/v1/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Senha atual não preenchida');
  });

  it('Não deve atualizar user que não existe', async () => {
    const newUser = {
      full_name: 'New User',
      password: '12345678',
    };

    const response = await request(app)
      .patch(`/api/v1/user/invalidId`)
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário não existe');
  });

  it('Não deve atualizar user deletado', async () => {
    const user = {
      full_name: 'Usuario',
      email: generateValidEmail(),
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    const id = response.body.id;

    await request(app)
      .delete(`/api/v1/user/${id}`)
      .set('Authorization', `Bearer ${token}`);

    const newUser = {
      full_name: 'New User',
      password: '12345678',
    };

    const res = await request(app)
      .patch(`/api/v1/user/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Usuário não existe');
  });

  it('Não deve atualizar user com senha atual incorreta', async () => {
    const newUser = {
      full_name: 'New User',
      password: 'wrongPassword',
    };

    const response = await request(app)
      .patch(`/api/v1/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Senha atual incorreta');
  });

  it('Não deve atualizar user com email já em uso', async () => {
    const user = {
      full_name: 'Usuario',
      email: generateValidEmail(),
      password: '12345678',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(user);

    const id = response.body.id;

    const newUser = {
      email: emailExists,
      password: '12345678',
    };

    const res = await request(app)
      .patch(`/api/v1/user/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email já está em uso');
  });
});
