import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    cors: {
      origin: 'http://localhost:5173',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    },
  });

  // Increase event listeners limit
  process.setMaxListeners(60);

  // Increase server timeouts
  await app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}
bootstrap();