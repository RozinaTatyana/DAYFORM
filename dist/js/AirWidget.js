import { APIWidget } from './APIWidget.js';
export class AirWidget extends APIWidget {
  constructor(config, dashboard) { super({ ...config, title: 'Воздух вокруг', symbol: '≈' }, dashboard); }
  url(city) { return `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi,pm2_5&timezone=auto`; }
  hasData(data) { return Number.isFinite(data?.current?.european_aqi); }
  showData(data) {
    const aqi = Math.max(0, Math.round(data.current.european_aqi));
    const category = aqi <= 20 ? 0 : aqi <= 40 ? 1 : aqi <= 60 ? 2 : aqi <= 80 ? 3 : aqi <= 100 ? 4 : 5;
    const labels = ['Хороший', 'Удовлетворительный', 'Умеренный', 'Плохой', 'Очень плохой', 'Крайне плохой'];
    const main = this.element('div', 'air-index'); main.append(this.element('div', 'big-number', aqi), this.element('span', 'pill', labels[category]));
    const meter = this.element('div', 'air-meter'); meter.setAttribute('aria-hidden', 'true'); for (let i = 0; i < 6; i++) meter.append(this.element('span', i === category ? 'active' : ''));
    this.output.replaceChildren(main, meter, this.element('p', 'api-details', 'Европейский индекс AQI · ниже — лучше'));
  }
}
