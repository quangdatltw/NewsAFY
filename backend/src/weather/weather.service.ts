import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly weatherAPI =
    'http://api.weatherapi.com/v1/current.json?key=6dad79fdd0ed4b37b8e64535251105&q=auto:ip&aqi=yes';

  async getWeatherData() {
    const response = await axios.get(this.weatherAPI);
    const html = response.data;

    return html;
  }
}
