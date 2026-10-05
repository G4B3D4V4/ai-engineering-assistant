import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const enableApiDocs = (app: INestApplication, globalPrefix: string): void => {
  const docUiEnabled: boolean = process.env.DOCS_UI_ENABLED
    ? JSON.parse(process.env.DOCS_UI_ENABLED)
    : false;

  if (!docUiEnabled) return;

  const options = new DocumentBuilder()
    .setTitle('AI Engineering Assistant API')
    .setDescription('API documentation for AI Engineering Assistant')
    .setVersion('1.0')
    .addTag('Backend API')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt-token')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`/${globalPrefix}/docs`, app, document);
};
