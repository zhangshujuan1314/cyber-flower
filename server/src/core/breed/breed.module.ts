import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BreedController } from './breed.controller';
import { BreedService } from './breed.service';
import { SeedSchema } from './seed.schema';
import { FlowerModule } from '../flower/flower.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Seed', schema: SeedSchema }]),
    FlowerModule,
  ],
  controllers: [BreedController],
  providers: [BreedService],
  exports: [BreedService],
})
export class BreedModule {}
