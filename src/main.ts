import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV === 'development',
    }),
  );

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task API')
    .setDescription(
      'Documentação da Task API para gerenciamento de tarefas, usuários e autenticação da aplicação.',
    )
    .setVersion('1.0.0')
    .setContact(
      'Cristiano Ferreira Mothe',
      'https://github.com/CristianoSFMothe/task-api',
      '',
    )
    .setExternalDoc(
      'LinkedIn de Cristiano Ferreira Mothe',
      'https://www.linkedin.com/in/cristiano-da-silva-ferreira/',
    )
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3333;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API rodando em: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger em: http://localhost:${port}/docs`);
}

void bootstrap();
