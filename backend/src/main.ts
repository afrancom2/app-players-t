import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { ValidationFailedException } from './common/exceptions/validation-failed.exception.js';
import { flattenValidationErrors } from './common/validation/format-validation-errors.js';
import { runSeed } from './seed/run-seed.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({ origin: corsOrigins });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new ValidationFailedException(flattenValidationErrors(errors)),
    }),
  );

  if (configService.get<string>('AUTO_SEED') === 'true') {
    const dataSource = app.get(DataSource);
    let hasData = true;
    try {
      const [{ count }] = await dataSource.query('SELECT COUNT(*)::int AS count FROM users');
      hasData = count > 0;
    } catch {
      hasData = false;
    }
    if (!hasData) {
      console.log('Base de datos vacía: ejecutando seed inicial...');
      await runSeed(app);
    }
  }

  const port = configService.get<string>('PORT', '3000');
  await app.listen(port);
}
await bootstrap();
