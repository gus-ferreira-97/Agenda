const { DataSource } = require('typeorm');
require('dotenv').config();

const required = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente ${key} não está definida no .env`);
  }
}

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});