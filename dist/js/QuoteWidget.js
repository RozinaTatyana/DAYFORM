import { UIComponent } from './UIComponent.js';
const QUOTES = ['Не обязательно успеть всё. Достаточно сделать место для важного.', 'Внимание — это то, из чего складывается твой день.', 'Маленький шаг тоже меняет расстояние.', 'Пауза — часть ритма, а не его отсутствие.', 'Одна законченная мысль ценнее десяти открытых вкладок.'];
export class QuoteWidget extends UIComponent {
  constructor(config, dashboard) { super({ ...config, title: 'Мысль дня', symbol: '“' }, dashboard); this.index = Number.isInteger(config.state?.index) && config.state.index >= 0 && config.state.index < QUOTES.length ? config.state.index : 0; }
  render() { const root = super.render(); this.quote = this.element('p', 'quote-text', QUOTES[this.index]); const footer = this.element('div', 'quote-footer'); footer.append(this.element('span', '', 'Заметки DAYFORM'), this.button('Другая мысль', 'Показать другую мысль', () => { this.index = (this.index + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length; this.quote.textContent = QUOTES[this.index]; this.changed(); }, '')); this.content.append(this.quote, footer); return root; }
  serialize() { return { ...super.serialize(), state: { index: this.index } }; }
}
