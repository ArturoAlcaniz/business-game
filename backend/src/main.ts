import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Permite solicitudes desde el frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permite enviar cookies y encabezados de autenticación
  });

  await app.listen(3001);
}
bootstrap();