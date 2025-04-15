import { Controller, Get, Body, Param, Delete } from '@nestjs/common';
import { DantriNewsService } from './dantri-news.service';
import { GetNewDto } from './dto/get-new.dto';

@Controller('news/dantri')
export class DantriNewsController {
  constructor(private readonly dantriNewsService: DantriNewsService) {}

  @Get('/body-html')
  async getBodyHtml(@Body() getNewDto: GetNewDto) {
    return await this.dantriNewsService.getBodyHtml(getNewDto);
  }

  @Get('/body-text')
  async getBodyText(@Body() getNewDto: GetNewDto) {
    return await this.dantriNewsService.getBodyText(getNewDto);
  }

  @Get()
  findAll() {
    return this.dantriNewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dantriNewsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dantriNewsService.remove(+id);
  }
}
