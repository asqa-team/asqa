import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { KafkaOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { generateKafkaClientOptions } from './bot/KafkaClientOptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
      transform: true,
  }));

  const configService = app.get(ConfigService);

  const options = generateKafkaClientOptions(configService)
  app.connectMicroservice<KafkaOptions>(options);

  await app.startAllMicroservices();

  const port = configService.get('SERVER_PORT');
  await app.listen(port);
}

bootstrap();
