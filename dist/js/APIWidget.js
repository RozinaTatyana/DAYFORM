import { UIComponent } from './UIComponent.js';
export const CITIES = { moscow: { name: 'Москва', lat: 55.75, lon: 37.62 }, petersburg: { name: 'Петербург', lat: 59.94, lon: 30.31 }, kazan: { name: 'Казань', lat: 55.79, lon: 49.12 }, sochi: { name: 'Сочи', lat: 43.6, lon: 39.73 }, kaliningrad: { name: 'Калининград', lat: 54.71, lon: 20.51 } };
export class APIWidget extends UIComponent {
  constructor(config, dashboard) { super(config, dashboard); this.city = Object.hasOwn(CITIES, config.state?.city) ? config.state.city : 'moscow'; }
  render() {
    const root = super.render(); this.output = this.element('div'); this.output.setAttribute('aria-live', 'polite');
    const footer = this.element('div', 'api-source');
    this.citySelect = this.element('select', 'city-select'); this.citySelect.setAttribute('aria-label', `Город: ${this.title}`);
    for (const [key, city] of Object.entries(CITIES)) { const option = this.element('option', '', city.name); option.value = key; this.citySelect.append(option); }
    this.citySelect.value = this.city;
    this.listen(this.citySelect, 'change', () => { this.city = this.citySelect.value; this.changed(); void this.load(); });
    const refresh = this.button('↻', `Обновить: ${this.title}`, () => void this.load());
    footer.append(this.citySelect, this.element('span', '', 'Open-Meteo'), refresh);
    this.content.append(this.output, footer); void this.load(); return root;
  }
  showState(text, state) { this.output.dataset.state = state; this.output.replaceChildren(this.element('p', `api-state ${state}`, text)); }
  async load() {
    this.request?.abort(); clearTimeout(this.timeout);
    const request = new AbortController(); this.request = request;
    this.showState('Узнаём, что снаружи…', 'loading');
    this.output.setAttribute('aria-busy', 'true');
    this.timeout = setTimeout(() => request.abort('timeout'), 12000);
    try {
      const response = await fetch(this.url(CITIES[this.city]), { signal: request.signal });
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (this.destroyed || this.request !== request) return;
      if (!this.hasData(data)) this.showState('Для этого города пока нет данных.', 'empty');
      else { this.output.dataset.state = 'success'; this.showData(data); }
    } catch (error) {
      if (this.destroyed || this.request !== request || (request.signal.aborted && request.signal.reason !== 'timeout')) return;
      this.showState('Не удалось получить данные. Попробуй обновить.', 'error');
    } finally {
      if (this.request === request) { clearTimeout(this.timeout); this.output.setAttribute('aria-busy', 'false'); }
    }
  }
  serialize() { return { ...super.serialize(), state: { city: this.city } }; }
  destroy() { this.request?.abort(); clearTimeout(this.timeout); super.destroy(); }
}
