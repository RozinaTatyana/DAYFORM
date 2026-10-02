import { UIComponent } from './UIComponent.js';
export class DataWidget extends UIComponent {
  render() { const root=super.render();this.store=this.dashboard.store;this.listen(this.store,'date',()=>this.update());this.listen(this.dashboard.events,'data',()=>this.refresh());this.listen(this.content,'click',event=>{const button=event.target.closest('[data-action]');if(button)this.action(button.dataset.action,button,event);});this.listen(this.content,'change',event=>this.change(event));this.listen(this.content,'submit',event=>{event.preventDefault();try{this.submit(event.target,new FormData(event.target));const input=this.content.querySelector('form input[name=text],form input[name=name]');if(input)input.value='';}catch(error){this.message(error.message);}});this.update();return root; }
  refresh() {
    // Updating a chart elsewhere must not erase an unfinished form here.
    const drafts = [...this.content.querySelectorAll('form')].map(form => Object.fromEntries(new FormData(form)));
    const focus = document.activeElement;
    const focusedName = this.content.contains(focus) && focus.closest('form') ? focus.name : null;
    this.update();
    [...this.content.querySelectorAll('form')].forEach((form, index) => {
      for (const field of form.elements) if (field.name && drafts[index]?.[field.name] !== undefined) field.value = drafts[index][field.name];
      if (focusedName) for (const field of form.elements) if (field.name === focusedName) field.focus();
    });
  }
  action(){} change(){} submit(){} update(){}
  actionButton(text,action,label=text){const button=this.element('button','small-button',text);button.type='button';button.dataset.action=action;button.setAttribute('aria-label',label);return button;}
  input(name,label,type='text',value=''){const input=this.element('input','field');input.name=name;input.type=type;input.setAttribute('aria-label',label);input.placeholder=label;input.value=value;return input;}
  select(name,label,options,value){const select=this.element('select','field');select.name=name;select.setAttribute('aria-label',label);for(const [id,text]of options){const option=this.element('option','',text);option.value=id;select.append(option);}if(value!==undefined)select.value=value;return select;}
  submitButton(text){const button=this.element('button','button dark',text);button.type='submit';return button;}
  message(text){this.dashboard.announce(text);let message=this.content.querySelector('.error-inline');if(!message){message=this.element('p','error-inline');message.setAttribute('role','alert');this.content.append(message);}message.textContent=text;}
  empty(text){return this.element('p','widget-empty',text);}
}
