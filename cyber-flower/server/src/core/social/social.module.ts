import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { FriendRelationSchema, GardenVisitSchema } from './social.schema';
import { FlowerModule } from '../flower/flower.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FriendRelation', schema: FriendRelationSchema },
      { name: 'GardenVisit', schema: GardenVisitSchema },
    ]),
    FlowerModule,
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
