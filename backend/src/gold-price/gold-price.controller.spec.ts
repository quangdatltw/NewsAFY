import { Test, TestingModule } from '@nestjs/testing';
import { GoldPriceController } from './gold-price.controller';
import { GoldPriceService } from './gold-price.service';

describe('GoldPriceController', () => {
  let controller: GoldPriceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoldPriceController],
      providers: [GoldPriceService],
    }).compile();

    controller = module.get<GoldPriceController>(GoldPriceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
