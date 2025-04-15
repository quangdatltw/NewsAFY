import { Injectable } from '@nestjs/common';
import { GetNewDto } from './dto/get-new.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class DantriNewsService {
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
    const $date = $('div.author-wrap div.author-meta time.author-time');
    const $title = $('h1.title-page.detail');
    const $description = $('h2.singular-sapo');
    const $author = $('div.author-wrap div.author-meta div.author-name');

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
    const $article = $('div.singular-content');
    $article.find('figure').remove();

    return $article;
  }

  findAll() {
    return `This action returns all dantriNews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dantriNew`;
  }

  remove(id: number) {
    return `This action removes a #${id} dantriNew`;
  }
}
