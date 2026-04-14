import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
});

const env = envSchema.parse(process.env);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
};
