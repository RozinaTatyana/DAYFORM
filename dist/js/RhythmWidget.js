import { UIComponent } from './UIComponent.js';
import { dateOffset } from './WorkspaceStore.js';
import { barChart } from './charts.js';
export class RhythmWidget extends UIComponent {
  constructor(config,dashboard){super({...config,title:'Часы внимания'},dashboard);this.period=7;}
  render(){const root=super.render();this.listen(this.dashboard.events,'data',()=>this.update());this.listen(this.content,'change',event=>{if(event.target.name==='period'){this.period=Number(event.target.value);this.update();}});this.update();return root;}
  update(){const days=Array.from({length:this.period},(_,i)=>{const date=dateOffset(i-this.period+1);return {label:new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU',{weekday:'short'}),value:this.dashboard.sessions.filter(s=>s.date===date).reduce((sum,s)=>sum+s.minutes,0)};});const total=days.reduce((sum,d)=>sum+d.value,0);const heading=this.element('div','widget-subheading');const totalText=this.element('span','subtle-text');totalText.append(this.element('strong','accent-text',`${Math.round(total/60*10)/10} ч`),document.createTextNode(' за последние дни'));const select=this.element('select','period-select');select.name='period';select.setAttribute('aria-label','Период активности');for(const[value,text]of[[7,'Неделя'],[14,'2 недели']]){const option=this.element('option','',text);option.value=value;select.append(option);}select.value=this.period;heading.append(totalText,select);this.content.replaceChildren(heading,barChart(days),this.element('p','chart-note','Твой ритм, без гонки за продуктивностью.'));}
}
