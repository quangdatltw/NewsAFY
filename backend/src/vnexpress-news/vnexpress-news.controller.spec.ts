import { Test, TestingModule } from '@nestjs/testing';
import { VnexpressNewsController } from './vnexpress-news.controller';
import { VnexpressNewsService } from './vnexpress-news.service';

describe('VnexpressNewsController', () => {
  let controller: VnexpressNewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VnexpressNewsController],
      providers: [VnexpressNewsService],
    }).compile();

    controller = module.get<VnexpressNewsController>(VnexpressNewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
