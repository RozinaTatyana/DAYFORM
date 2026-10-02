import { APIWidget } from './APIWidget.js';
export class WeatherWidget extends APIWidget {
  constructor(config, dashboard) { super({ ...config, title: 'За окном', symbol: '☼' }, dashboard); }
  url(city) { return `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`; }
  hasData(data) { return Number.isFinite(data?.current?.temperature_2m); }
  showData(data) {
    const current = data.current;
    const code = current.weather_code;
    const description = code === 0 ? 'Ясно' : code <= 3 ? 'Облачно' : code <= 48 ? 'Туман' : code <= 67 ? 'Дождь' : code <= 77 ? 'Снег' : code <= 86 ? 'Осадки' : 'Гроза';
    const main = this.element('div', 'weather-main');
    const icon = this.element('span', 'weather-icon', code === 0 ? '☼' : code <= 3 ? '☁' : '☂'); icon.setAttribute('aria-hidden', 'true');
    main.append(this.element('div', 'big-number', `${Math.round(current.temperature_2m)}°`), icon);
    const feels = Number.isFinite(current.apparent_temperature) ? ` · ощущается как ${Math.round(current.apparent_temperature)}°` : '';
    this.output.replaceChildren(main, this.element('p', 'api-details', `${description}${feels}`));
  }
}
