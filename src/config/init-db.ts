import { AppDataSource } from "./datasource";
import logger from "../utils/logger";

let isInitialized = false;

export const initDB = async () => {
  if (!isInitialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database initialized");
    }
    isInitialized = true;
  }
};
