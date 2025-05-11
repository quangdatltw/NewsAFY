// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DantriNewsModule } from './dantri-news/dantri-news.module';
import { VnexpressNewsModule } from './vnexpress-news/vnexpress-news.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    VnexpressNewsModule,
    DantriNewsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute window
          limit: 150, // Allow 100 requests per minute
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}