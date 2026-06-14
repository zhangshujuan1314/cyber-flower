import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowerController } from './flower.controller';
import { FlowerService } from './flower.service';
import { GrowthEngine } from './growth.engine';
import { FlowerSchema } from './flower.schema';
import { CareLogSchema } from './care-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Flower', schema: FlowerSchema },
      { name: 'CareLog', schema: CareLogSchema },
    ]),
  ],
  controllers: [FlowerController],
  providers: [FlowerService, GrowthEngine],
  exports: [FlowerService],
})
export class FlowerModule {}
