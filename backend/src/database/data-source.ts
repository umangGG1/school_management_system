import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { getDatabaseConfigFromEnv } from '../common/config/runtime-config';

dotenv.config();

const database = getDatabaseConfigFromEnv();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: database.url,
  host: database.url ? undefined : database.host,
  port: database.url ? undefined : database.port,
  database: database.url ? undefined : database.database,
  username: database.url ? undefined : database.username,
  password: database.url ? undefined : database.password,
  ssl: database.ssl,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
