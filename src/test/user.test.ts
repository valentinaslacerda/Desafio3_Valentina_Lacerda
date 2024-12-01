import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../infra/data-source';
import { generateValidEmail } from './utils';

let token: string;
let clientId: string;
let cpfExists: string;
let emailExists: string;
let deletedClient: string;

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

describe();
