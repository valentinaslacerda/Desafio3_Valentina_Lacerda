import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
const PORT_DB = process.env.MYSQL_PORT as number | undefined;

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: PORT_DB,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  logging: true,
  migrations: ['src/infra/migrations/*.ts'],
  entities: ['src/domain/entities/*.ts'],
});
