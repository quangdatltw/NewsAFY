import { Test, TestingModule } from '@nestjs/testing';
import { DantriNewsService } from './dantri-news.service';

describe('DantriNewsService', () => {
  let service: DantriNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DantriNewsService],
    }).compile();

    service = module.get<DantriNewsService>(DantriNewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
