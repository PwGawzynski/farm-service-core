import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'process';

console.log(
  {
    type: (process.env.MYSQL_TYPE as 'mysql') || 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: +(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.DB_NAME || 'farm_service_core',
  },
  'INFO_MYSQL',
);

// npm run  migration:generate
// crate and move migration file to db/migrations
// npm run migration:run

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.MYSQL_TYPE as 'mysql') || 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: +(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.DB_NAME || 'farm_service_core',
  logging: true,
  entities: ['dist/src/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
