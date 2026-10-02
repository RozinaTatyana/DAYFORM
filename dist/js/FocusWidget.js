import { UIComponent } from './UIComponent.js';
export class FocusWidget extends UIComponent {
  constructor(config, dashboard) {
    super({ ...config, title: 'Время для фокуса', symbol: '◷' }, dashboard);
    this.duration = [15, 25, 45].includes(config.state?.duration) ? config.state.duration : 25;
    this.remaining = Number.isFinite(config.state?.remaining) ? Math.max(0, Math.min(this.duration * 60, config.state.remaining)) : this.duration * 60;
    this.running = false;
    this.category = ['Творчество','Развитие','Личное'].includes(config.state?.category) ? config.state.category : 'Личное';
  }
  render() {
    const root = super.render();
    const inner = this.element('div', 'focus-inner'); const numbers = this.element('div');
    this.value = this.element('div', 'timer-value'); this.value.setAttribute('role', 'timer'); this.value.setAttribute('aria-label', 'Осталось времени');
    this.caption = this.element('p', 'focus-caption', 'ОДНА ЗАДАЧА. ПОЛНОЕ ВНИМАНИЕ.'); numbers.append(this.value, this.caption);
    this.ring = this.element('div', 'focus-ring'); this.ring.setAttribute('aria-hidden', 'true'); this.ring.append(this.element('span', '', '✳'));
    inner.append(numbers, this.ring);
    const footer = this.element('div', 'focus-footer');
    this.start = this.button('Начать', 'Начать фокус-сессию', () => this.toggle(), 'button dark');
    const reset = this.button('↺', 'Сбросить таймер', () => this.reset());
    this.select = this.element('select', 'duration-select'); this.select.setAttribute('aria-label', 'Длительность фокус-сессии');
    for (const minutes of [15, 25, 45]) { const option = this.element('option', '', `${minutes} мин`); option.value = minutes; this.select.append(option); }
    this.select.value = this.duration; this.listen(this.select, 'change', () => { this.duration = Number(this.select.value); this.reset(); });
    this.categorySelect = this.element('select','focus-category'); this.categorySelect.setAttribute('aria-label','Категория фокус-сессии');
    for(const category of ['Творчество','Развитие','Личное']) { const option=this.element('option','',category); option.value=category; this.categorySelect.append(option); }
    this.categorySelect.value=this.category; this.listen(this.categorySelect,'change',()=>{this.category=this.categorySelect.value;this.changed();});
    const hint=this.element('p','focus-hint','Выбери одно дело. Подари ему всё внимание.');
    footer.append(this.start, reset, this.select); this.content.append(hint, this.categorySelect, inner, footer); this.update(); return root;
  }
  toggle() {
    if (this.running) this.pause();
    else {
      if (this.remaining <= 0) this.remaining = this.duration * 60;
      this.running = true; this.deadline = Date.now() + this.remaining * 1000;
      this.interval = setInterval(() => this.tick(), 250);
      this.update(); this.changed();
    }
  }
  tick() {
    this.remaining = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
    this.update();
    if (!this.remaining) { this.pause(); this.dashboard.recordSession(this.duration, this.category); this.caption.textContent = 'СЕССИЯ ЗАВЕРШЕНА. ВРЕМЯ ВЫДОХНУТЬ.'; this.dashboard.announce('Фокус-сессия завершена'); }
  }
  pause() { if (this.running) this.remaining = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000)); this.running = false; clearInterval(this.interval); this.update(); this.changed(); }
  reset() { this.running = false; clearInterval(this.interval); this.remaining = this.duration * 60; this.caption.textContent = 'ОДНА ЗАДАЧА. ПОЛНОЕ ВНИМАНИЕ.'; this.update(); this.changed(); }
  update() {
    if (!this.value) return;
    this.value.textContent = `${String(Math.floor(this.remaining / 60)).padStart(2, '0')}:${String(this.remaining % 60).padStart(2, '0')}`;
    this.start.textContent = this.running ? 'Пауза' : 'Начать'; this.start.setAttribute('aria-label', this.running ? 'Поставить таймер на паузу' : 'Начать фокус-сессию');
    this.select.disabled = this.running;
    if(this.categorySelect) this.categorySelect.disabled=this.running;
    this.root.classList.toggle('focus-running', this.running);
    this.ring.style.setProperty('--progress', `${(1 - this.remaining / (this.duration * 60)) * 100}%`);
  }
  serialize() { const remaining = this.running ? Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000)) : this.remaining; return { ...super.serialize(), state: { duration: this.duration, remaining, category: this.category } }; }
  destroy() { clearInterval(this.interval); super.destroy(); }
}
