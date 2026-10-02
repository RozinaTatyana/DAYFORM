import { UIComponent } from './UIComponent.js';
import { dayKey } from './storage.js';
export class HabitWidget extends UIComponent {
  #habits;
  constructor(config, dashboard) {
    super({ ...config, title: 'Маленькие ритуалы', symbol: '✳' }, dashboard);
    this.#habits = Array.isArray(config.state?.habits) ? config.state.habits.filter(h => h && typeof h.text === 'string' && typeof h.id === 'string').slice(0, 12).map(h => ({ id: h.id, text: h.text.slice(0, 60), date: typeof h.date === 'string' ? h.date : '' })) : [{ id: crypto.randomUUID(), text: 'Стакан воды', date: '' }, { id: crypto.randomUUID(), text: 'Немного движения', date: '' }, { id: crypto.randomUUID(), text: 'Время без экрана', date: '' }];
  }
  render() {
    const root = super.render(); this.list = this.element('div', 'habit-list');
    this.listen(this.list, 'click', event => { const button = event.target.closest('[data-habit]'); if (!button) return; const habit = this.#habits.find(h => h.id === button.dataset.habit); if (!habit) return; habit.date = habit.date === dayKey() ? '' : dayKey(); this.update(); this.changed(); this.list.querySelector(`[data-habit="${habit.id}"]`)?.focus(); });
    const form = this.element('form', 'habit-edit'); this.input = this.element('input', 'text-input'); this.input.placeholder = 'Добавить свой ритуал'; this.input.maxLength = 60; this.input.required = true; this.input.setAttribute('aria-label', 'Новый ритуал');
    const add = this.element('button', '', '+'); add.setAttribute('aria-label', 'Добавить ритуал'); form.append(this.input, add);
    this.listen(form, 'submit', event => { event.preventDefault(); const text = this.input.value.trim(); if (!text || this.#habits.length >= 12) return; this.#habits.push({ id: crypto.randomUUID(), text, date: '' }); this.input.value = ''; this.update(); this.changed(); });
    this.content.append(this.list, form, this.element('p', 'micro-label', 'Отметки обновляются каждый день.')); this.update();
    this.dayInterval = setInterval(() => { if (this.lastDay !== dayKey()) this.update(); }, 60000);
    return root;
  }
  update() { this.lastDay = dayKey(); this.list.replaceChildren(); for (const habit of this.#habits) { const row = this.element('div', 'habit-row'); const button = this.element('button', '', habit.date === this.lastDay ? '✓' : '+'); button.dataset.habit = habit.id; button.setAttribute('aria-label', habit.text); button.setAttribute('aria-pressed', String(habit.date === this.lastDay)); row.append(this.element('span', '', habit.text), button); this.list.append(row); } this.input.disabled = this.#habits.length >= 12; }
  serialize() { return { ...super.serialize(), state: { habits: this.#habits } }; }
  destroy() { clearInterval(this.dayInterval); super.destroy(); }
}
