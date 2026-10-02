import { dayKey } from './storage.js';
export const dateOffset = (offset, base = new Date()) => { const date = new Date(base); date.setDate(date.getDate() + offset); return dayKey(date); };
export const COLORS = ['#b79bdd', '#c6e77e', '#e7b590', '#98c4d8', '#d9abd0'];
const safeText = (value, max = 160) => typeof value === 'string' ? value.slice(0, max) : '';
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
export function createWorkspace(demo = false) {
  const projects = demo ? [
    {id:'portfolio',name:'Новое портфолио',description:'Собрать работы, которыми хочется делиться',category:'Творчество',color:0,due:dateOffset(5)},
    {id:'reading',name:'Клуб хороших книг',description:'Дочитать, обсудить, найти новые идеи',category:'Развитие',color:1,due:dateOffset(10)},
    {id:'space',name:'Пространство для себя',description:'Обновить рабочее место и личные ритуалы',category:'Личное',color:2,due:dateOffset(14)}
  ] : [];
  const cards = demo ? [
    ['Собрать лучшие работы','portfolio','done',-4],['Выбрать шрифты и палитру','portfolio','done',-2],['Составить структуру кейса','portfolio','done',-1],['Оформить главный экран','portfolio','doing',1],['Написать описание проекта','portfolio','todo',3],
    ['Выбрать книгу месяца','reading','done',-3],['Прочитать первые главы','reading','done',-1],['Записать интересные мысли','reading','doing',2],['Подготовить встречу клуба','reading','todo',7],
    ['Разобрать рабочий стол','space','done',-2],['Выбрать лампу','space','doing',4],['Добавить вечерний ритуал','space','todo',8],['Организовать полку','space','todo',10]
  ].map(([text,project,status,offset]) => ({id:crypto.randomUUID(),text,project,status,due:dateOffset(offset)})) : [];
  const habits = demo ? [
    {id:'water',name:'Вода утром',icon:'air',days:Array.from({length:28},(_,i)=>i).filter(i=>i%7!==2).map(i=>dateOffset(-i))},
    {id:'read',name:'20 минут чтения',icon:'note',days:Array.from({length:28},(_,i)=>i).filter(i=>i%4!==0).map(i=>dateOffset(-i))},
    {id:'walk',name:'Прогулка без телефона',icon:'weather',days:Array.from({length:28},(_,i)=>i).filter(i=>i%3!==1).map(i=>dateOffset(-i))},
    {id:'rest',name:'Вечер без экрана',icon:'focus',days:Array.from({length:28},(_,i)=>i).filter(i=>i%5<3).map(i=>dateOffset(-i))}
  ] : [];
  const schedule = demo ? [
    {id:crypto.randomUUID(),text:'Утренний план',date:dayKey(),time:'09:00',duration:20,category:'Личное',done:true},
    {id:crypto.randomUUID(),text:'Портфолио · главный экран',date:dayKey(),time:'10:30',duration:45,category:'Творчество',done:false},
    {id:crypto.randomUUID(),text:'Прогулка и перезагрузка',date:dayKey(),time:'13:00',duration:30,category:'Личное',done:false},
    {id:crypto.randomUUID(),text:'Книга и новые идеи',date:dayKey(),time:'17:30',duration:40,category:'Развитие',done:false},
    {id:crypto.randomUUID(),text:'Обсудить идеи для портфолио',date:dateOffset(1),time:'11:00',duration:30,category:'Творчество',done:false}
  ] : [];
  return {projects,cards,habits,schedule};
}
export function validateWorkspace(input) {
  const source = input && typeof input === 'object' ? input : {};
  const projects = (Array.isArray(source.projects) ? source.projects : []).slice(0,50).filter(p=>p && safeText(p.id) && safeText(p.name)).map(p=>({id:safeText(p.id),name:safeText(p.name,80),description:safeText(p.description,240),category:safeText(p.category,40)||'Личное',color:Number.isInteger(p.color)?Math.abs(p.color)%COLORS.length:0,due:isDate(p.due)?p.due:dayKey()}));
  const ids = new Set(projects.map(p=>p.id));
  const cards = (Array.isArray(source.cards)?source.cards:[]).slice(0,500).filter(c=>c && safeText(c.id) && safeText(c.text) && ids.has(c.project)).map(c=>({id:safeText(c.id),text:safeText(c.text),project:c.project,status:['todo','doing','done'].includes(c.status)?c.status:'todo',due:isDate(c.due)?c.due:dayKey()}));
  const habits=(Array.isArray(source.habits)?source.habits:[]).slice(0,12).filter(h=>h&&safeText(h.id)&&safeText(h.name)).map(h=>({id:safeText(h.id),name:safeText(h.name,60),icon:['air','note','weather','focus','habits'].includes(h.icon)?h.icon:'habits',days:[...new Set((Array.isArray(h.days)?h.days:[]).filter(isDate))].slice(-730)}));
  const schedule=(Array.isArray(source.schedule)?source.schedule:[]).slice(0,300).filter(s=>s&&safeText(s.id)&&safeText(s.text)&&isDate(s.date)&&/^\d{2}:\d{2}$/.test(s.time)&&Number(s.time.slice(0,2))<24&&Number(s.time.slice(3))<60).map(s=>({id:safeText(s.id),text:safeText(s.text),date:s.date,time:s.time,duration:Number.isFinite(s.duration)?Math.max(5,Math.min(240,s.duration)):30,category:safeText(s.category,40)||'Личное',done:!!s.done}));
  return {projects,cards,habits,schedule};
}
export class WorkspaceStore extends EventTarget {
  constructor(data) { super(); this.data = validateWorkspace(data); this.selectedDate = dayKey(); }
  change() { this.dispatchEvent(new Event('change')); }
  selectDate(date) { if (!isDate(date)) return; this.selectedDate=date; this.dispatchEvent(new Event('date')); }
  addProject(values) { if(this.data.projects.length>=50)throw new Error('Можно добавить до 50 проектов'); const name=safeText(values.name,80).trim(); if(!name)throw new Error('Введите название проекта'); const project={id:crypto.randomUUID(),name,description:safeText(values.description,240),category:values.category||'Личное',color:this.data.projects.length%COLORS.length,due:isDate(values.due)?values.due:dayKey()}; this.data.projects.push(project); this.change(); return project; }
  addCard(values) { if(this.data.cards.length>=500)throw new Error('Можно добавить до 500 карточек'); if(!this.data.projects.some(p=>p.id===values.project))throw new Error('Выберите проект'); const text=safeText(values.text).trim();if(!text)throw new Error('Введите название задачи');const card={id:crypto.randomUUID(),text,project:values.project,status:'todo',due:isDate(values.due)?values.due:dayKey()};this.data.cards.push(card);this.change();return card; }
  moveCard(id,status) { if(!['todo','doing','done'].includes(status))return;const card=this.data.cards.find(c=>c.id===id);if(card){card.status=status;this.change();} }
  deleteCard(id) {this.data.cards=this.data.cards.filter(c=>c.id!==id);this.change();}
  addEvent(values) { if(this.data.schedule.length>=300)throw new Error('Можно добавить до 300 событий');const text=safeText(values.text).trim();if(!text||!/^\d{2}:\d{2}$/.test(values.time))throw new Error('Укажите название и время');const item={id:crypto.randomUUID(),text,date:isDate(values.date)?values.date:this.selectedDate,time:values.time,duration:Number(values.duration)||30,category:values.category||'Личное',done:false};this.data.schedule.push(item);this.change();return item; }
  toggleEvent(id) {const item=this.data.schedule.find(s=>s.id===id);if(item){item.done=!item.done;this.change();}}
  deleteEvent(id) {this.data.schedule=this.data.schedule.filter(s=>s.id!==id);this.change();}
  addHabit(name) {name=safeText(name,60).trim();if(!name)throw new Error('Введите название привычки');if(this.data.habits.length>=12)throw new Error('Можно добавить до 12 привычек');this.data.habits.push({id:crypto.randomUUID(),name,icon:'habits',days:[]});this.change();}
  toggleHabit(id,date) {if(!isDate(date)||date>dayKey())return;const habit=this.data.habits.find(h=>h.id===id);if(habit){habit.days=habit.days.includes(date)?habit.days.filter(d=>d!==date):[...habit.days,date].slice(-730);this.change();}}
  deleteHabit(id) {this.data.habits=this.data.habits.filter(h=>h.id!==id);this.change();}
  progress(project) {const cards=this.data.cards.filter(c=>c.project===project);return {total:cards.length,done:cards.filter(c=>c.status==='done').length,percent:cards.length?Math.round(cards.filter(c=>c.status==='done').length/cards.length*100):0};}
}
