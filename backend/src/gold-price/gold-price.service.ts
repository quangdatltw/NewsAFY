import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoldPriceService {
  private readonly btmcAPI: string =
    'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v';

  async getPriceBTMC() {
    const response = await axios.get(this.btmcAPI);
    const html = response.data;

    return html;
  }
}
