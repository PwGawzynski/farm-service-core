import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'process';

console.log(
  {
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: +(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  'INFO_MYSQL',
);

export const dataSourceOptions: DataSourceOptions = {
  type: (process.env.MYSQL_TYPE as 'mysql') || 'mysql',
  driver: 'mysql',
  host: process.env.MYSQL_HOST,
  port: +(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  logging: true,
  entities: ['dist/src/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
