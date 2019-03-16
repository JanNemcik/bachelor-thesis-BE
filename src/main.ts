import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MQTT_CLIENT_OPTIONS_PROD, MQTT_CLIENT_OPTIONS_DEV } from './shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(MQTT_CLIENT_OPTIONS_DEV);
  app.setGlobalPrefix('api');
  await app.startAllMicroservicesAsync();
  await app.listen(4000);
}
bootstrap();
