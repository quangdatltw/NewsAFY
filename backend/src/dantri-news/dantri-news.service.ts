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
    const $title = $('h1');
    const $description = $('h2');
    const $author = $('div.author-wrap div.author-meta div.author-name');
    const audioLinkResult = this.tryGetAudioLink($, $date.text().trim());

    const sideData = {
      title: $title.text().trim(),
      description: $description.text().trim(),
      metadata: {
        author: $author.text().trim(),
        date: $date.text().trim(),
        audioUrl: undefined,
      },
    };

    if (audioLinkResult.success) {
      sideData.metadata = {
        ...sideData.metadata,
        audioUrl: audioLinkResult.url,
      };
    }

    return sideData;
  }

  getBody($: cheerio.CheerioAPI) {
    const $body = $('div.singular-content').length
      ? $('div.singular-content')
      : $('div.e-magazine__body');

    $body.find('figure').remove();

    return $body;
  }

  getRSS() {
    return 'https://dantri.com.vn/rss/home.rss';
  }

  tryGetAudioLink(
    $: cheerio.CheerioAPI,
    date: string,
  ): { success: boolean; url?: string } {
    const articleId = $('div[data-module="article-audio-new"]').attr(
      'data-article-id',
    );

    if (articleId == undefined) return { success: false };

    const input = date;
    const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);

    if (!match) return { success: false };

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = match[3];

    const url =
      'https://acdn.dantri.com.vn/' +
      year +
      '/' +
      month +
      '/' +
      day +
      '/' +
      articleId +
      '/full_1.mp3';

    return { success: true, url: url };
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
