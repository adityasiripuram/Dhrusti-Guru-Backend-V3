import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();

import { app } from "./app";
import { logger } from "./utils/logger";
import { AppDataSource } from "./config/database";
import { seedInitialData } from "./utils/seed";

const PORT = process.env.PORT!;

async function start() {
  try {
    await AppDataSource.initialize();
    logger.info("Database connection established.");

    await seedInitialData();
    logger.info("Seed data initialized.");

    app.listen(PORT, () => {
      logger.info(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

start();
