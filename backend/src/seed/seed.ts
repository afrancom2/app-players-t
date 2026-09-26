import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { runSeed } from './run-seed.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await runSeed(app);
  await app.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
