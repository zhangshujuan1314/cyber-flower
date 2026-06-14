import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({ origin: true, credentials: true });

  // API前缀
  app.setGlobalPrefix('v1');

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('赛博养花 API')
    .setDescription('Cyber Bloom — AI驱动的虚拟养花平台')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 启动
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[CyberBloom] Server running on port ${port}`);
  console.log(`[CyberBloom] Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
