import { UIComponent } from './UIComponent.js';
export class NoteWidget extends UIComponent {
  constructor(config, dashboard) { super({ ...config, title: 'На полях', symbol: '✎' }, dashboard); this.text = typeof config.state?.text === 'string' ? config.state.text.slice(0, 4000) : ''; }
  render() { const root = super.render(); this.area = this.element('textarea', 'note-area'); this.area.placeholder = 'Мысль, которую не хочется потерять…'; this.area.maxLength = 4000; this.area.value = this.text; this.area.setAttribute('aria-label', 'Текст заметки'); const meta = this.element('div', 'note-meta'); this.counter = this.element('span'); meta.append(this.element('span', '', 'Место для мыслей'), this.counter); this.listen(this.area, 'input', () => { this.text = this.area.value; this.update(); this.changed(); }); this.content.append(this.area, meta); this.update(); return root; }
  update() { this.counter.textContent = `${this.text.length} / 4000`; }
  serialize() { return { ...super.serialize(), state: { text: this.text } }; }
}
