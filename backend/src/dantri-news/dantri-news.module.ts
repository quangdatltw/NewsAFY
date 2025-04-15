import { Module } from '@nestjs/common';
import { DantriNewsService } from './dantri-news.service';
import { DantriNewsController } from './dantri-news.controller';

@Module({
  controllers: [DantriNewsController],
  providers: [DantriNewsService],
})
export class DantriNewsModule {}
