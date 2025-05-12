import { Controller, Get } from '@nestjs/common';
import { GoldPriceService } from './gold-price.service';

@Controller('gold-price')
export class GoldPriceController {
  constructor(private readonly goldPriceService: GoldPriceService) {}

  @Get()
  async getPriceBTMC() {
    return await this.goldPriceService.getPriceBTMC();
  }
}
