import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./config";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 10, // connection pool size (optional)
  },
  logging: ["error"],
  entities: ["src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
});
