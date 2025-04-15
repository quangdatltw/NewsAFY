import { Module } from '@nestjs/common';
import { VnexpressNewsService } from './vnexpress-news.service';
import { VnexpressNewsController } from './vnexpress-news.controller';

@Module({
  controllers: [VnexpressNewsController],
  providers: [VnexpressNewsService],
})
export class VnexpressNewsModule {}
