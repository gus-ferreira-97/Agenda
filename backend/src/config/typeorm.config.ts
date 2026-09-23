import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isMigratorMode = process.env.MIGRATOR_MODE === 'true';

const username = isMigratorMode
  ? process.env.DB_MIGRATOR_USERNAME
  : process.env.DB_USERNAME;

const password = isMigratorMode
  ? process.env.DB_MIGRATOR_PASSWORD
  : process.env.DB_PASSWORD;

const required = ['DB_HOST', 'DB_PORT', 'DB_DATABASE'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente ${key} não está definida no .env`);
  }
}

if (!username || !password) {
  throw new Error(
    `Credenciais de ${isMigratorMode ? 'migrator' : 'aplicação'} não configuradas no .env`,
  );
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username,
  password,
  database: process.env.DB_DATABASE,
  ssl:
    process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});