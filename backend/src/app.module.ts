import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DantriNewsModule } from './dantri-news/dantri-news.module';
import { VnexpressNewsModule } from './vnexpress-news/vnexpress-news.module';

@Module({
  imports: [VnexpressNewsModule, DantriNewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
