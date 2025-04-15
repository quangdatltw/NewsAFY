import { Controller, Get, Body, Param, Delete } from '@nestjs/common';
import { VnexpressNewsService } from './vnexpress-news.service';
import { GetNewDto } from './dto/get-new.dto';

@Controller('news/vnexpress')
export class VnexpressNewsController {
  constructor(private readonly vnexpressNewsService: VnexpressNewsService) {}

  @Get('/body-html')
  async getBodyHtml(@Body() getNewDto: GetNewDto) {
    return await this.vnexpressNewsService.getBodyHtml(getNewDto);
  }

  @Get('/body-text')
  async getBodyText(@Body() getNewDto: GetNewDto) {
    return await this.vnexpressNewsService.getBodyText(getNewDto);
  }

  @Get()
  findAll() {
    return this.vnexpressNewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vnexpressNewsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vnexpressNewsService.remove(+id);
  }
}
