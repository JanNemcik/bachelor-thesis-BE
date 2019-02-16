import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      servers: [
        {
          host: 'iot.itprof.sk',
          port: 1883
        }
      ],
      username: 'bachelor',
      password: 'iotbachelor'
    }
  });
  app.setGlobalPrefix('api');
  await app.startAllMicroservicesAsync();
  await app.listen(4000);
}
bootstrap();
