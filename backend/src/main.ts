import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin:
      process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim() !== ''
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Clarifield API')
    .setDescription(
      `Clarifield is a web-based portal designed to help enterprises standardize, manage, and enforce definitions and formats for fields used in APIs, databases, and software projects.\nIt serves as a centralized repository that bridges the gap between security/compliance teams, product managers, and developers, ensuring consistency and efficiency across all projects.`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap()
  .then(() => {
    console.log(`Server is running on port ${process.env.PORT ?? 5000}`);
  })
  .catch((error) => {
    console.error('Error starting the server:', error);
  });
