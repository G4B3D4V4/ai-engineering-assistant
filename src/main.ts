import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';
import { enableApiDocs } from './common/swagger/api-docs.js';

const globalPrefix = 'api';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix(globalPrefix);
  app.useLogger(app.get(Logger));
  enableApiDocs(app, globalPrefix);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
