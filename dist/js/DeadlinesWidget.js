import { DataWidget } from './DataWidget.js';
import { dayKey } from './storage.js';
import { COLORS } from './WorkspaceStore.js';
export class DeadlinesWidget extends DataWidget {
  constructor(config,dashboard){super({...config,title:'На горизонте'},dashboard);}
  update(){const list=this.element('div','deadline-list');const cards=this.store.data.cards.filter(c=>c.status!=='done').sort((a,b)=>a.due.localeCompare(b.due)).slice(0,3);for(const card of cards){const project=this.store.data.projects.find(p=>p.id===card.project);const row=this.element('a','deadline-item');row.href='#projects';const mark=this.element('span','deadline-mark','✳');mark.style.background=`${COLORS[project.color]}44`;const text=this.element('div');text.append(this.element('strong','',card.text),this.element('small','',`${project.name} · ${new Date(`${card.due}T12:00:00`).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}`));const tag=this.element('span',`status-tag ${card.due<dayKey()?'overdue':card.status}`,card.due<dayKey()?'Просрочено':card.status==='doing'?'В работе':'В планах');row.append(mark,text,tag);list.append(row);}this.content.replaceChildren(cards.length?list:this.empty('Ближайших дедлайнов нет. Можно выдохнуть.'));}
}
