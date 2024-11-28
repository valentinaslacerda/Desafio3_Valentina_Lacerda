import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './seeds/MainSeeder';
import * as dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? 'test.env' : '.env';
dotenv.config({ path: envFile });
console.log(process.env.NODE_ENV);
const PORT_DB = parseInt(process.env.MYSQL_PORT || '3306', 10);

const options: DataSourceOptions & SeederOptions = {
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
  seeds: [MainSeeder],
};

export const AppDataSource = new DataSource(options);

console.log(
  `AppDataSource initialized for database: ${process.env.MYSQL_DATABASE}`
);
