import { Test, TestingModule } from '@nestjs/testing';
import { GoldPriceService } from './gold-price.service';

describe('GoldPriceService', () => {
  let service: GoldPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoldPriceService],
    }).compile();

    service = module.get<GoldPriceService>(GoldPriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
