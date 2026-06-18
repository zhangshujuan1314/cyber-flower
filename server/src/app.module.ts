import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { AiModule } from './ai-layer/ai.module';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './core/user/user.module';
import { FlowerModule } from './core/flower/flower.module';
import { BreedModule } from './core/breed/breed.module';
import { ChatModule } from './core/chat/chat.module';
import { SocialModule } from './core/social/social.module';
import { SeasonModule } from './core/season/season.module';
import { CollectionModule } from './core/collection/collection.module';

@Module({
  controllers: [AppController],
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber-bloom'),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AiModule, AuthModule, UserModule, FlowerModule, BreedModule, ChatModule,
    SocialModule, SeasonModule, CollectionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
