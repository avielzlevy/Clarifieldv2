import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
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
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap()
  .then(() => {
    console.log(`Server is running on port ${process.env.PORT ?? 5000}`);
  })
  .catch((error) => {
    console.error('Error starting the server:', error);
  });
