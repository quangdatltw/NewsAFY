import { Test, TestingModule } from '@nestjs/testing';
import { VnexpressNewsService } from './vnexpress-news.service';

describe('VnexpressNewsService', () => {
  let service: VnexpressNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VnexpressNewsService],
    }).compile();

    service = module.get<VnexpressNewsService>(VnexpressNewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
