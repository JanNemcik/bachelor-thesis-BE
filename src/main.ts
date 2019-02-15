import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('debug4');
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      servers: [
        {
          // host: '192.168.56.101',
          // port: 1883
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
