import { Module } from '@nestjs/common';
import { GoldPriceService } from './gold-price.service';
import { GoldPriceController } from './gold-price.controller';

@Module({
  controllers: [GoldPriceController],
  providers: [GoldPriceService],
})
export class GoldPriceModule {}
