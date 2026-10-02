import { icon } from './icons.js';
/** The shared lifecycle. Every listener belongs to the component's AbortSignal. */
export class UIComponent {
  constructor({ id = crypto.randomUUID(), title, type, symbol = '○', minimized = false, state = {} }, dashboard) {
    if (new.target === UIComponent) throw new TypeError('UIComponent is abstract');
    Object.assign(this, { id, title, type, symbol, minimized, state, dashboard });
    this.lifecycle = new AbortController();
    this.destroyed = false;
    this.page = dashboard.currentPage ?? 'overview';
  }
  element(tag, className = '', text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  listen(target, event, handler) { target.addEventListener(event, handler, { signal: this.lifecycle.signal }); }
  button(text, label, action, className = 'icon-button') {
    const button = this.element('button', className, text);
    button.type = 'button'; button.setAttribute('aria-label', label);
    this.listen(button, 'click', action);
    return button;
  }
  render() {
    if (this.root) return this.root;
    this.root = this.element('article', 'widget');
    this.root.dataset.type = this.type; this.root.dataset.id = this.id;
    const heading = this.element('header', 'widget-header');
    const symbol = this.element('span', 'widget-symbol'); symbol.append(icon(this.type));
    const title = this.element('h2', '', this.title); title.id = `title-${this.id}`;
    this.root.setAttribute('aria-labelledby', title.id);
    const controls = this.element('div', 'widget-controls');
    this.minimizeButton = this.button('−', `Свернуть: ${this.title}`, () => this.minimize());
    controls.append(this.minimizeButton, this.button('×', `Удалить: ${this.title}`, () => this.close()));
    heading.append(symbol, title, controls);
    this.content = this.element('div', 'widget-content'); this.content.id = `content-${this.id}`;
    this.minimizeButton.setAttribute('aria-controls', this.content.id);
    this.root.append(heading, this.content);
    this.moves = this.element('div', 'move-controls');
    this.moves.append(this.button('Раньше', `Переместить ${this.title} раньше`, () => this.dashboard.moveWidget(this.id, -1), ''), this.button('Позже', `Переместить ${this.title} позже`, () => this.dashboard.moveWidget(this.id, 1), ''));
    this.root.append(this.moves); this.setArranging(this.dashboard.arranging);
    this.applyMinimized();
    return this.root;
  }
  applyMinimized() {
    this.root.classList.toggle('minimized', this.minimized);
    this.content.hidden = this.minimized;
    this.minimizeButton.textContent = this.minimized ? '+' : '−';
    this.minimizeButton.setAttribute('aria-expanded', String(!this.minimized));
    this.minimizeButton.setAttribute('aria-label', `${this.minimized ? 'Развернуть' : 'Свернуть'}: ${this.title}`);
  }
  minimize() { this.minimized = !this.minimized; this.applyMinimized(); this.changed(); }
  close() { this.dashboard.removeWidget(this.id); }
  setArranging(value) { if (this.moves) this.moves.hidden = !value; }
  changed() { this.dashboard.save(); }
  serialize() { return { id: this.id, type: this.type, page: this.page, placement: this.placement, minimized: this.minimized, state: this.state }; }
  destroy() { this.destroyed = true; this.lifecycle.abort(); this.root?.remove(); }
}
