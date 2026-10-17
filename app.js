'use strict';
(() => {
const C=window.UniverseCore, config=window.UNIVERSE_CONFIG;
const $=id=>document.getElementById(id);
const isLive=config.mode==='live';
const key='universe:'+config.eventId;
let stars=[],step=0,busy=false,loadBusy=false,hasLoaded=!isLive;
let draft=null;
let toastTimer;
const hints=[
  'Un vis mare sau unul mic. Poate chiar unul la care nu m-am gândit încă…',
  'Poate felul în care râd, o calitate sau un lucru pe care îl fac.',
  'Comedie, aventură sau un film care încă nu s-a inventat?',
  'O excursie, un concert, o zi nebună sau ceva foarte simplu.',
  'Un gând pe care mi-ar plăcea să-l recitesc peste patru ani.'
];
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function storageRead(k,fallback){try{return JSON.parse(localStorage.getItem(k))??fallback;}catch{return fallback;}}
function storageWrite(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}}
function storageRemove(k){try{localStorage.removeItem(k);}catch{}}
function uid(){return crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16);});}
function newDraft(){return {id:uid(),name:'',color:C.COLORS[0],answers:['','','','','']};}
function validRecord(s){return s&&typeof s.id==='string'&&!C.validate(s);}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
function saveDraft(){if(!storageWrite(key+':draft',draft))$('form-error').textContent='Browserul nu poate păstra ciorna. Păstrează această fereastră deschisă până trimiți.';}
function openDialog(el){el.showModal();}
function dateLabel(){if(!config.eventDate)return '';const d=new Date(config.eventDate+'T12:00:00');return isNaN(d)?'':d.toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'});}
if(config.birthdayName){document.title=`${config.birthdayName} · 14 ani de magie`;$('title').replaceChildren(document.createTextNode(`${config.birthdayName},`),node('br'),node('em','14 ani de magie.'));}
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function celebrate(color=C.COLORS[0]){
 if(reducedMotion.matches)return;
 const shower=node('div',undefined,'star-shower');shower.setAttribute('aria-hidden','true');
 for(let i=0;i<24;i++){const p=node('span',i%3?'✦':'✧');p.style.setProperty('--flight',`${i*15}deg`);p.style.setProperty('--reach',`${110+(i%5)*40}px`);p.style.setProperty('--spark-color',i%2?color:C.COLORS[i%C.COLORS.length]);p.style.animationDelay=(i%4)*.03+'s';shower.append(p);}
 (document.querySelector('dialog[open]')||document.body).append(shower);setTimeout(()=>shower.remove(),1600);
}
const dock=$('mobile-start');dock.textContent=`✧ Lasă o stea pentru ${config.birthdayName||'sărbătorită'} ↗`;
dock.onclick=()=>{$('start').click();};
if('IntersectionObserver' in window){const watch=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('in-view');watch.unobserve(e.target);}},{threshold:.1});document.querySelectorAll('.section-top,.keepsake').forEach(e=>{e.classList.add('reveal');watch.observe(e);});}

$('footer-event').textContent=[config.birthdayName||'14 ANI',dateLabel()||'O MICĂ INFINITATE'].join(' · ');
$('mode-note').textContent=isLive?'Mesajele trimise de invitați se adună în același cer. Numele și răspunsurile pot fi citite de cei care au linkul.':'MOD DEMONSTRATIV · Stelele inițiale sunt exemple. Ce adaugi aici rămâne numai în acest browser; nu se trimite sărbătoritei.';
for(let i=0;i<95;i++){const d=node('i');d.style.left=((i*73.37)%100)+'%';d.style.top=((i*47.73)%100)+'%';d.style.animationDelay=-(i%5)+'s';d.style.opacity=.12+(i%5)/10;$('dust').append(d);}
function renderSky(){
  $('stars').replaceChildren();$('connections').replaceChildren();$('star-count').textContent=stars.length;$('empty').hidden=!!stars.length;$('random').disabled=!stars.length;
  stars.forEach((s,i)=>{
    const p=C.position(s.id,i,stars.length),b=node('button',undefined,'star');b.type='button';b.style.left=p.x+'%';b.style.top=p.y+'%';b.style.setProperty('--star',s.color);b.style.setProperty('--pulse-delay',(-i*.7)+'s');b.style.setProperty('--arrival-delay',(Math.min(i,20)*.05)+'s');b.setAttribute('aria-label',`Citește steaua: ${s.name}`);b.append(node('span','✦','star-mark'),node('span',s.name,'star-name'));b.onclick=()=>readStar(s);$('stars').append(b);
    if(i>0){const previous=C.position(stars[i-1].id,i-1,stars.length);const l=document.createElementNS('http://www.w3.org/2000/svg','line');for(const [k,v] of Object.entries({x1:previous.x,y1:previous.y,x2:p.x,y2:p.y}))l.setAttribute(k,v);$('connections').append(l);}
  });
}
function readStar(s){
  const out=$('reader-content');out.replaceChildren();const icon=node('div','✦','reader-star');icon.style.color=s.color;const h=node('h2',s.name,'reader-heading');h.id='reader-title';out.append(icon,h);
  s.answers.forEach((a,i)=>{const part=node('section',undefined,'answer');part.append(node('h4',C.QUESTIONS[i]),node('p',a||'Un gând rămas printre stele.'));out.append(part);});
  openDialog($('reader'));celebrate(s.color);
}
function renderDirectory(){const query=$('search').value.trim().toLocaleLowerCase('ro');const list=$('guest-list');list.replaceChildren();const filtered=stars.filter(s=>s.name.toLocaleLowerCase('ro').includes(query));for(const s of filtered){const b=node('button',undefined,'guest-item');const mark=node('span','✦');mark.style.color=s.color;b.append(mark,node('strong',s.name),node('span','↗'));b.onclick=()=>{$('guests').close();readStar(s);};list.append(b);}if(!filtered.length)list.append(node('p','Nicio stea găsită.','helper'));}
async function rpc(name,payload){
  if(!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(config.supabaseUrl)||!config.publishableKey)throw new Error('configuration');
  const response=await fetch(config.supabaseUrl.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey},body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error('server');return response.json();
}
async function refresh(){
 if(!isLive||loadBusy||document.hidden)return;loadBusy=true;
 try{const result=await rpc('universe_list',{p_event:config.eventId});if(!Array.isArray(result))throw new Error('response');stars=result.filter(validRecord);hasLoaded=true;renderSky();$('sync-status').classList.remove('bad');$('sync-status').textContent='Cer actualizat · '+new Date().toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'});}
 catch(e){$('sync-status').classList.add('bad');$('sync-status').textContent=e.message==='configuration'?'Conectarea nu este configurată. Completează config.js înainte de petrecere.':'Nu putem actualiza cerul acum. Verifică internetul; mesajele deja încărcate rămân afișate.';}
 finally{loadBusy=false;}
}
const sampleNames=['Alexia','Mara','Daria','Andrei','Sofia','Ioana','David','Teo','Ana'];
if(!isLive){const stored=storageRead(key+':stars',null);stars=Array.isArray(stored)?stored.filter(validRecord):sampleNames.map((name,i)=>({id:'demo-'+i,name,color:C.COLORS[i%C.COLORS.length],answers:[['Să ajungi în toate locurile pe care acum le ai salvate în telefon.','Să ai curajul să-ți urmezi propriul drum.','Să cânți pe scena la care visezi.'][i%3],'Felul în care faci o zi obișnuită să pară o aventură.','Planuri mari, baterie 2%','Un concert și o călătorie cu trenul, cu playlistul nostru pe repeat.','Sper că încă râzi la aceleași glume. Și că nu ai uitat cât de mult poți!']}));$('sync-status').textContent='Exemple demonstrative · salvare locală pe acest dispozitiv';}
renderSky();refresh();if(isLive)setInterval(refresh,15000);document.addEventListener('visibilitychange',refresh);
function start(){
 const saved=storageRead(key+':draft',null);draft=saved&&typeof saved.id==='string'&&typeof saved.name==='string'&&Array.isArray(saved.answers)&&saved.answers.length===5&&saved.answers.every(a=>typeof a==='string')?saved:newDraft();if(!C.COLORS.includes(draft.color))draft.color=C.COLORS[0];step=0;renderWizard();openDialog($('wizard'));
}
function capture(){if(step===0){draft.name=$('name-input').value;}else if(step<=5){draft.answers[step-1]=$('answer-input').value;}saveDraft();}
function renderWizard(){
 const out=$('wizard-content');out.replaceChildren();$('form-error').textContent='';$('progress').replaceChildren();for(let i=0;i<7;i++)$('progress').append(node('span',undefined,i<=step?'done':''));$('back').hidden=step===0;$('next').textContent=step===6?'Trimite steaua ✧':'Continuă →';
 if(step===0){const title=node('h2','Mai întâi, cine luminează cerul?');title.id='wizard-title';out.append(title,node('p','Cum vrei să apară numele tău sub stea?','helper'));const l=node('label','Numele tău');l.htmlFor='name-input';const input=node('input');input.id='name-input';input.maxLength=40;input.autocomplete='given-name';input.placeholder='Prenume sau poreclă';input.value=draft.name;input.required=true;input.oninput=()=>{draft.name=input.value;saveDraft();};out.append(l,input,node('label','Alege culoarea stelei tale'));const colors=node('div',undefined,'colors');C.COLORS.forEach((color,i)=>{const b=node('button');b.type='button';b.className='color';b.style.setProperty('--swatch',color);b.setAttribute('aria-label',['Auriu','Turcoaz','Liliachiu','Roz','Albastru'][i]);b.setAttribute('aria-pressed',color===draft.color);b.onclick=()=>{draft.color=color;saveDraft();colors.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));};colors.append(b);});out.append(colors);}
 else if(step<=5){const i=step-1;out.append(node('div',`ÎNTREBAREA ${step} DIN 5`,'step-caption'));const title=node('h2',C.QUESTIONS[i]);title.id='wizard-title';out.append(title,node('p',hints[i],'helper'));const label=node('label','Gândul tău');label.htmlFor='answer-input';const input=node('textarea');input.id='answer-input';input.maxLength=500;input.placeholder='Scrie cu cuvintele tale…';input.value=draft.answers[i];const count=node('div',`${input.value.length}/500`,'char-count');input.oninput=()=>{draft.answers[i]=input.value;count.textContent=`${input.value.length}/500`;saveDraft();};const skip=node('button','Sar peste această întrebare →','quiet skip');skip.type='button';skip.onclick=()=>{draft.answers[i]='';saveDraft();step++;renderWizard();};out.append(label,input,count,skip);}
 else {const title=node('h2','Gata să-ți aprinzi steaua?');title.id='wizard-title';out.append(title,node('p',draft.name,'review-name'));draft.answers.forEach((a,i)=>{const section=node('div',undefined,'answer');section.append(node('h4',C.QUESTIONS[i]),node('p',a||'Întrebare sărită'));out.append(section);});out.append(node('div',isLive?'Numele și răspunsurile tale vor putea fi citite de sărbătorită și de persoanele care au linkul. Apăsând „Trimite steaua”, alegi să le adaugi în univers.':'Aceasta este o probă: steaua va fi păstrată numai în acest browser. Niciun mesaj nu este trimis sărbătoritei.','consent'));}
 $('wizard').scrollTop=0;
}
$('star-form').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;capture();if(step===0&&!draft.name.trim()){$('form-error').textContent='Scrie numele tău ca să continuăm.';return;}
 if(step<6){step++;renderWizard();return;}
 const error=C.validate(draft);if(error){$('form-error').textContent=error;return;}
 busy=true;$('next').disabled=true;$('back').disabled=true;$('next').textContent='Se aprinde steaua…';const value=C.normalize(draft);
 try{
   if(isLive){await rpc('universe_add',{p_event:config.eventId,p_id:value.id,p_name:value.name,p_color:value.color,p_answers:value.answers});}
   else {const next=[...stars.filter(s=>s.id!==value.id),value];if(!storageWrite(key+':stars',next))throw new Error('local');}
   if(!stars.some(s=>s.id===value.id))stars.push(value);renderSky();storageRemove(key+':draft');celebrate(value.color);
   $('progress').replaceChildren();$('wizard-content').replaceChildren();const success=node('div',undefined,'success');success.append(node('div','✦','reader-star'),node('h2','Steaua ta este aici.'),node('p',isLive?`Mulțumim! Gândurile tale au devenit parte din universul ${config.birthdayName==='Antonia'?'Antoniei':config.birthdayName||'sărbătoritei'}.`:'Proba a reușit! Steaua ta este salvată în acest browser.'));const button=node('button','Vezi steaua mea ↗','primary');button.type='button';button.onclick=()=>{$('wizard').close();readStar(value);};success.append(button);$('wizard-content').append(success);$('back').hidden=true;$('next').hidden=true;toast(isLive?'O nouă lumină în univers. ✧':'Stea demonstrativă salvată local. ✧');
 }catch(e){$('form-error').textContent=e.message==='local'?'Browserul nu a putut salva steaua. Cuvintele tale sunt încă în formular.':'Steaua nu a fost confirmată de server. Verifică internetul și încearcă din nou. Cuvintele tale au rămas în formular.';}
 finally{busy=false;$('next').disabled=false;$('back').disabled=false;$('next').textContent='Trimite steaua ✧';}
});
$('start').onclick=()=>{$('next').hidden=false;start();};$('back').onclick=()=>{capture();step=Math.max(0,step-1);renderWizard();};
for(const d of document.querySelectorAll('dialog')){d.querySelector('[data-close]').onclick=()=>{if(!busy)d.close();};d.addEventListener('cancel',e=>{if(busy)e.preventDefault();});}
$('random').onclick=()=>{if(stars.length)readStar(stars[Math.floor(Math.random()*stars.length)]);};$('directory').onclick=()=>{renderDirectory();openDialog($('guests'));};$('search').oninput=renderDirectory;
$('share').onclick=async()=>{if(location.protocol==='file:'){toast('Copiază linkul după publicarea pe GitHub Pages.');return;}try{await navigator.clipboard.writeText(location.href.split('#')[0]);toast('Link copiat. Trimite-l prietenilor sau folosește-l pentru QR.');}catch{toast('Copiază adresa site-ului din bara browserului.');}};
function download(content,type,filename){const a=node('a');const url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function exportReady(){if(!hasLoaded){toast('Așteaptă încărcarea mesajelor înainte de descărcare.');return false;}return true;}
$('export').onclick=()=>{if(exportReady())download(JSON.stringify({version:1,event:config.eventId,birthdayName:config.birthdayName,exportedAt:new Date().toISOString(),demo:!isLive,questions:C.QUESTIONS,stars},null,2),'application/json','universul-14-mesaje.json');};
$('poster').onclick=()=>{
 if(!exportReady())return;const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('xmlns',ns);const height=Math.max(1350,Math.ceil(stars.length/10)*150+550);svg.setAttribute('viewBox',`0 0 1800 ${height}`);
 const add=(tag,attrs,text)=>{const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;svg.append(el);return el;};
 add('rect',{width:1800,height,fill:'#081621'});add('text',{x:900,y:105,'text-anchor':'middle',fill:'#82e1d1','font-family':'sans-serif','font-size':18,'letter-spacing':6},'O MICĂ INFINITATE');
 add('text',{x:900,y:205,'text-anchor':'middle',fill:'#f7d58b','font-family':'Georgia,serif','font-size':65},config.birthdayName?`${config.birthdayName} · universul la 14 ani`:'Universul tău la 14 ani');add('text',{x:900,y:260,'text-anchor':'middle',fill:'#b1c3c9','font-family':'sans-serif','font-size':22},[dateLabel(),!isLive?'POSTER DEMONSTRATIV':'14 ani · Fiecare om, o lumină.'].filter(Boolean).join(' · '));
 stars.forEach((s,i)=>{const p=C.position(s.id,i,stars.length),x=110+p.x*15.8,y=310+p.y*(height-500)/100;add('text',{x,y,fill:s.color,'text-anchor':'middle','font-size':45},'✦');add('text',{x,y:y+38,fill:'#e0e9e9','text-anchor':'middle','font-size':18,'font-family':'sans-serif'},s.name);});
 add('text',{x:900,y:height-55,'text-anchor':'middle',fill:'#b1c3c9','font-size':18,'font-family':'sans-serif'},'Oameni care îmi fac universul mai frumos.');download(new XMLSerializer().serializeToString(svg),'image/svg+xml','universul-14-poster.svg');
};
$('book').onclick=()=>{
 if(!exportReady())return;const w=window.open('','_blank');if(!w){toast('Permite deschiderea albumului într-o fereastră nouă.');return;}const doc=w.document;doc.title='Universul la 14 ani — album de mesaje';const style=doc.createElement('style');style.textContent='body{font:16px/1.7 Georgia,serif;color:#142d3a;max-width:800px;margin:40px auto;padding:20px}h1{font-size:42px}h2{color:#315e68}h3{font:13px Arial,sans-serif;margin-top:25px}p{white-space:pre-wrap;overflow-wrap:anywhere}article{break-before:page;padding-top:20px}button{padding:12px 20px;background:#142d3a;color:white;border:0;border-radius:6px;cursor:pointer}@media print{button{display:none}body{margin:0;padding:0}@page{margin:20mm}}';doc.head.append(style);const title=doc.createElement('h1');title.textContent=config.birthdayName?`${config.birthdayName} · universul la 14 ani`:'Universul tău la 14 ani';doc.body.append(title);const sub=doc.createElement('p');sub.textContent=`${dateLabel()} · ${stars.length} stele${!isLive?' · ALBUM DEMONSTRATIV':''}`;doc.body.append(sub);const btn=doc.createElement('button');btn.textContent='Tipărește / Salvează ca PDF';btn.onclick=()=>w.print();doc.body.append(btn);
 for(const s of stars){const article=doc.createElement('article'),h=doc.createElement('h2');h.textContent='✦ '+s.name;article.append(h);s.answers.forEach((a,i)=>{const q=doc.createElement('h3'),p=doc.createElement('p');q.textContent=C.QUESTIONS[i];p.textContent=a||'—';article.append(q,p);});doc.body.append(article);}
};
})();
