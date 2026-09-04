const { DataSource } = require('typeorm');
require('dotenv').config();

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'agenda',
  password: process.env.DB_PASSWORD || 'agenda123',
  database: process.env.DB_DATABASE || 'agenda',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});