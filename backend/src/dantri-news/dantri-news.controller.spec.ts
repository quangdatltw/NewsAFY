import { Test, TestingModule } from '@nestjs/testing';
import { DantriNewsController } from './dantri-news.controller';
import { DantriNewsService } from './dantri-news.service';

describe('DantriNewsController', () => {
  let controller: DantriNewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DantriNewsController],
      providers: [DantriNewsService],
    }).compile();

    controller = module.get<DantriNewsController>(DantriNewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
