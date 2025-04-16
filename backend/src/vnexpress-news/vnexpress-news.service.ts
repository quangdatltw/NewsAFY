import { Injectable } from '@nestjs/common';
import { GetNewDto } from './dto/get-new.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class VnexpressNewsService {
  async getBodyHtml(getNewDto: GetNewDto) {
    const response = await axios.get(getNewDto.url);
    const html = response.data;
    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    const sideData = this.getSideData($);
    const $body = this.getBody($);

    return {
      link: getNewDto.url,
      ...sideData,
      body: $body.html(),
    };
  }

  async getBodyText(getNewDto: GetNewDto) {
    const response = await axios.get(getNewDto.url);
    const html = response.data;
    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    const sideData = this.getSideData($);
    const $body = this.getBody($);

    return {
      link: getNewDto.url,
      ...sideData,
      body: $body.text().trim(),
    };
  }

  getSideData($: cheerio.CheerioAPI) {
    const $date = $('span.date');
    const $title = $('h1.title-detail');
    const $description = $('p.description');
    const $author = $('article.fck_detail p[style="text-align:right;"]');

    return {
      title: $title.text().trim(),
      description: $description.text().trim(),
      metadata: {
        author: $author.text().trim(),
        date: $date.text().trim(),
      },
    };
  }

  getBody($: cheerio.CheerioAPI) {
    const $article = $('article.fck_detail');
    $article.find('div.width_common.box-tinlienquanv2').remove();
    $article.find('figure').remove();
    $article.find('#newsletters-details').remove();

    const $author = $article.find('p strong');
    $author.remove();

    return $article;
  }

  getRSS() {
    return 'https://vnexpress.net/rss/tin-moi-nhat.rss';
  }

  findAll() {
    return `This action returns all vnexpressNews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vnexpressNew`;
  }

  remove(id: number) {
    return `This action removes a #${id} vnexpressNew`;
  }
}
