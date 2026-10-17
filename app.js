'use strict';
(() => {
const C=window.UniverseCore, config=window.UNIVERSE_CONFIG;
const $=id=>document.getElementById(id);
const isLive=config.mode==='live';
const qaMode=new URLSearchParams(location.search).get('test')==='1';
if(qaMode)config.eventId+='-qa';
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
if(config.birthdayName){document.title=`${config.birthdayName} · 14 ani de magie`;$('title').replaceChildren(document.createTextNode(config.birthdayName),node('em','14 ani de magie'));}
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

const hero=document.querySelector('.intro');
if(window.matchMedia('(hover: hover)').matches&&!reducedMotion.matches){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--hero-x',((e.clientX-r.left)/r.width-.5)*16+'deg');hero.style.setProperty('--hero-y',-((e.clientY-r.top)/r.height-.5)*12+'deg');});hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--hero-x','0deg');hero.style.setProperty('--hero-y','0deg');});}
$('footer-event').textContent=[config.birthdayName||'14 ANI',dateLabel()||'O MICĂ INFINITATE'].join(' · ');
$('mode-note').textContent=qaMode?'UNIVERS DE TEST · Contribuțiile de aici nu apar în universul petrecerii.':isLive?'Un singur univers, toate mesajele prietenilor. Sincronizare automată.':'MOD DEMONSTRATIV · Mesajele de probă rămân doar în acest browser.';
for(let i=0;i<95;i++){const d=node('i');d.style.left=((i*73.37)%100)+'%';d.style.top=((i*47.73)%100)+'%';d.style.animationDelay=-(i%5)+'s';d.style.opacity=.12+(i%5)/10;$('dust').append(d);}
// Depth uses a damped animation frame loop, active only while the sky moves.
const sky=$('sky');
let depthX=0,depthY=0,targetX=0,targetY=0,depthFrame=0,skyDrag=null,beamSequence=0;
const clampDepth=v=>Math.max(-24,Math.min(24,v));
function paintDepth(){
 sky.style.setProperty('--depth-x',depthX+'px');sky.style.setProperty('--depth-y',depthY+'px');
 const w=sky.clientWidth||1,h=sky.clientHeight||1,points=[];
 sky.querySelectorAll('.star').forEach(b=>{
  const d=Number(b.dataset.depth),x=Number(b.dataset.x)+depthX*d/w*100,y=Number(b.dataset.y)+depthY*d/h*100;
  b.style.left=x+'%';b.style.top=y+'%';points.push({x,y});
 });
 $('connections').querySelectorAll('line').forEach((line,i)=>{const a=points[i],b=points[i+1];if(a&&b)for(const [k,v] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))line.setAttribute(k,v);});
}
function animateDepth(){
 depthX+=(targetX-depthX)*.14;depthY+=(targetY-depthY)*.14;
 const settled=Math.abs(targetX-depthX)+Math.abs(targetY-depthY)<.08;
 if(settled){depthX=targetX;depthY=targetY;}paintDepth();depthFrame=settled?0:requestAnimationFrame(animateDepth);
}
function moveDepth(x,y){if(reducedMotion.matches)return;targetX=clampDepth(x);targetY=clampDepth(y);if(!depthFrame)depthFrame=requestAnimationFrame(animateDepth);}
sky.addEventListener('pointerdown',e=>{if(e.target.closest('button')||reducedMotion.matches)return;skyDrag={id:e.pointerId,x:e.clientX,y:e.clientY};sky.setPointerCapture(e.pointerId);sky.classList.add('is-dragging');});
sky.addEventListener('pointermove',e=>{
 if(skyDrag&&e.pointerId===skyDrag.id)moveDepth((e.clientX-skyDrag.x)*.22,(e.clientY-skyDrag.y)*.22);
 else if(e.pointerType==='mouse'&&!skyDrag){const r=sky.getBoundingClientRect();moveDepth(((e.clientX-r.left)/r.width-.5)*32,((e.clientY-r.top)/r.height-.5)*32);}
});
function finishDepth(){skyDrag=null;sky.classList.remove('is-dragging');moveDepth(0,0);}
for(const event of ['pointerup','pointercancel','lostpointercapture','pointerleave'])sky.addEventListener(event,finishDepth);
sky.addEventListener('keydown',e=>{if(e.target!==sky)return;const shifts={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};if(shifts[e.key]){e.preventDefault();moveDepth(targetX+shifts[e.key][0],targetY+shifts[e.key][1]);}if(e.key==='Home'){e.preventDefault();moveDepth(0,0);}});
sky.addEventListener('blur',()=>{if(!skyDrag)moveDepth(0,0);});
$('universe').addEventListener('close',()=>{beamSequence++;sky.querySelectorAll('.friendship-beam').forEach(e=>e.remove());finishDepth();});
window.addEventListener('resize',paintDepth);
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){cancelAnimationFrame(depthFrame);depthFrame=0;depthX=depthY=targetX=targetY=0;paintDepth();}});
async function connectStar(s){
 const sequence=++beamSequence;
 sky.querySelectorAll('.friendship-beam').forEach(e=>e.remove());
 const source=[...sky.querySelectorAll('.star')].find(b=>b.dataset.starId===s.id);
 if(!source||!$('universe').open||reducedMotion.matches){readStar(s);return;}
 skyDrag=null;sky.classList.remove('is-dragging');cancelAnimationFrame(depthFrame);depthFrame=0;targetX=depthX;targetY=depthY;
 const r=sky.getBoundingClientRect(),a=source.querySelector('.star-mark').getBoundingClientRect(),b=sky.querySelector('.universe-portrait img').getBoundingClientRect();
 const beam=document.createElementNS('http://www.w3.org/2000/svg','svg');beam.classList.add('friendship-beam');beam.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);beam.setAttribute('aria-hidden','true');beam.style.color=s.color;
 const line=document.createElementNS(beam.namespaceURI,'path');line.setAttribute('d',`M ${a.left+a.width/2-r.left} ${a.top+a.height/2-r.top} L ${b.left+b.width/2-r.left} ${b.top+b.height/2-r.top}`);line.setAttribute('pathLength','1');beam.append(line);sky.append(beam);
 source.classList.add('star-connected');sky.querySelector('.universe-portrait').classList.add('portrait-connected');
 await new Promise(resolve=>setTimeout(resolve,650));
 beam.remove();source.classList.remove('star-connected');sky.querySelector('.universe-portrait').classList.remove('portrait-connected');
 if(sequence===beamSequence&&$('universe').open)readStar(s);
}
let surpriseTimer=0;
function birthdaySurprise(){
 const host=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;
 document.querySelectorAll('.birthday-surprise').forEach(e=>e.remove());
 const overlay=node('div',undefined,'birthday-surprise');overlay.setAttribute('role','status');overlay.append(node('span','14','surprise-age'),node('p','La mulți ani, Antonia!'),node('small','Universul acesta strălucește pentru tine.'));
 if(!reducedMotion.matches)for(let i=0;i<32;i++){const spark=node('i',i%3?'✦':'✧');spark.setAttribute('aria-hidden','true');spark.style.setProperty('--fall-x',((i*37)%100)+'%');spark.style.setProperty('--fall-delay',(i%8)*.12+'s');spark.style.setProperty('--fall-color',C.COLORS[i%C.COLORS.length]);overlay.append(spark);}
 host.append(overlay);clearTimeout(surpriseTimer);surpriseTimer=setTimeout(()=>overlay.remove(),4600);
}
document.querySelectorAll('.photo-surprise').forEach(photo=>{
 let timer=0,origin=null,triggered=false;
 function cancelHold(){clearTimeout(timer);timer=0;photo.classList.remove('is-holding');origin=null;}
 photo.addEventListener('pointerdown',e=>{if(e.button!==0)return;cancelHold();triggered=false;origin={x:e.clientX,y:e.clientY};photo.classList.add('is-holding');timer=setTimeout(()=>{triggered=true;cancelHold();birthdaySurprise();},850);});
 photo.addEventListener('pointermove',e=>{if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>12)cancelHold();});
 for(const event of ['pointerup','pointercancel','pointerleave','blur'])photo.addEventListener(event,cancelHold);
 photo.addEventListener('contextmenu',e=>{e.preventDefault();});
 photo.addEventListener('click',e=>{e.preventDefault();if(e.detail===0){cancelHold();birthdaySurprise();}else if(!triggered)toast('Ține fotografia apăsată o clipă… ✧');});
});
function renderSky(){
  $('stars').replaceChildren();$('connections').replaceChildren();$('star-count').textContent=stars.length;$('star-unit').textContent=stars.length===1?'stea în univers':'stele în univers';$('empty').hidden=!!stars.length;$('random').disabled=!stars.length;
  stars.forEach((s,i)=>{
    const p=C.position(s.id,i,stars.length),b=node('button',undefined,'star');b.type='button';b.style.left=p.x+'%';b.style.top=p.y+'%';b.style.setProperty('--star',s.color);b.style.setProperty('--pulse-delay',(-i*.7)+'s');b.style.setProperty('--arrival-delay',(Math.min(i,20)*.05)+'s');b.dataset.starId=s.id;b.dataset.x=p.x;b.dataset.y=p.y;b.dataset.depth=.35+(i%4)*.25;b.style.setProperty('--star-depth',.9+(i%4)*.07);b.setAttribute('aria-label',`Citește steaua: ${s.name}`);b.append(node('span','✦','star-mark'),node('span',s.name,'star-name'));b.onclick=()=>connectStar(s);$('stars').append(b);
    if(i>0){const previous=C.position(stars[i-1].id,i-1,stars.length);const l=document.createElementNS('http://www.w3.org/2000/svg','line');for(const [k,v] of Object.entries({x1:previous.x,y1:previous.y,x2:p.x,y2:p.y}))l.setAttribute(k,v);$('connections').append(l);}
  });
  paintDepth();
}
function readStar(s){
  const out=$('reader-content');out.replaceChildren();const icon=node('div','✦','reader-star');icon.style.color=s.color;const h=node('h2',s.name,'reader-heading');h.id='reader-title';out.append(icon,h);
  s.answers.forEach((a,i)=>{const part=node('section',undefined,'answer');part.append(node('h4',C.QUESTIONS[i]),node('p',a||'Un gând rămas printre stele.'));out.append(part);});
  openDialog($('reader'));celebrate(s.color);
}
function renderDirectory(){const query=$('search').value.trim().toLocaleLowerCase('ro');const list=$('guest-list');list.replaceChildren();const filtered=stars.filter(s=>s.name.toLocaleLowerCase('ro').includes(query));for(const s of filtered){const b=node('button',undefined,'guest-item');const mark=node('span','✦');mark.style.color=s.color;b.append(mark,node('strong',s.name),node('span','↗'));b.onclick=()=>{$('guests').close();connectStar(s);};list.append(b);}if(!filtered.length)list.append(node('p','Nicio stea găsită.','helper'));}
async function rpc(name,payload){
 if(!config.apiUrl)throw new Error('configuration');
 const reading=name==='universe_list';const endpoint=config.apiUrl+'/api/stars';
 const body=reading?undefined:JSON.stringify({event:config.eventId,id:payload.p_id,name:payload.p_name,color:payload.p_color,answers:payload.p_answers});
 const response=await fetch(endpoint+(reading?'?event='+encodeURIComponent(config.eventId):''),{method:reading?'GET':'POST',headers:reading?{}:{'Content-Type':'application/json'},body,cache:'no-store',signal:AbortSignal.timeout(15000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'server');return data;
}
let refreshPromise=null;
async function refresh(){
 if(!isLive||document.hidden)return null;if(refreshPromise)return refreshPromise;
 refreshPromise=(async()=>{try{const result=await rpc('universe_list',{p_event:config.eventId});if(!Array.isArray(result))throw new Error('response');const next=result.filter(validRecord);const changed=JSON.stringify(next)!==JSON.stringify(stars);stars=next;hasLoaded=true;if(changed)renderSky();$('sync-status').classList.remove('bad');$('sync-status').textContent='Sincronizat · '+new Date().toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});return stars;}
 catch(e){$('sync-status').classList.add('bad');$('sync-status').textContent='Nu putem actualiza cerul acum. Verifică internetul; mesajele deja încărcate rămân afișate.';return null;}
 finally{refreshPromise=null;}})();return refreshPromise;
}
const sampleNames=['Alexia','Mara','Daria','Andrei','Sofia','Ioana','David','Teo','Ana'];
if(!isLive){const stored=storageRead(key+':stars',null);stars=Array.isArray(stored)?stored.filter(validRecord):sampleNames.map((name,i)=>({id:'demo-'+i,name,color:C.COLORS[i%C.COLORS.length],answers:[['Să ajungi în toate locurile pe care acum le ai salvate în telefon.','Să ai curajul să-ți urmezi propriul drum.','Să cânți pe scena la care visezi.'][i%3],'Felul în care faci o zi obișnuită să pară o aventură.','Planuri mari, baterie 2%','Un concert și o călătorie cu trenul, cu playlistul nostru pe repeat.','Sper că încă râzi la aceleași glume. Și că nu ai uitat cât de mult poți!']}));$('sync-status').textContent='Exemple demonstrative · salvare locală pe acest dispozitiv';}
renderSky();refresh();if(isLive)setInterval(refresh,5000);document.addEventListener('visibilitychange',refresh);window.addEventListener('online',refresh);
function start(){
 const saved=storageRead(key+':draft',null);draft=saved&&typeof saved.id==='string'&&typeof saved.name==='string'&&Array.isArray(saved.answers)&&saved.answers.length===5&&saved.answers.every(a=>typeof a==='string')?saved:newDraft();if(!C.COLORS.includes(draft.color))draft.color=C.COLORS[0];step=0;renderWizard();openDialog($('wizard'));
}
function capture(){if(step===0){draft.name=$('name-input').value;}else if(step<=5){draft.answers[step-1]=$('answer-input').value;}saveDraft();}
const CHAPTERS = [
 {title:'Un vis pentru tine',icon:'✧',theme:'dream',caption:'O dorință de pus printre stele.',starters:['Îți doresc să ai curajul să…','Mi-ar plăcea să te văd…','Sper să ajungi într-o zi…']},
 {title:'Ce te face specială',icon:'♡',theme:'heart',caption:'Unele lucruri merită spuse cu voce tare.',starters:['Îmi place la tine felul în care…','Tu faci orice zi mai frumoasă când…','Admir la tine…']},
 {title:'Filmul prieteniei',icon:'▶',theme:'cinema',caption:'Prieteniile bune merită propriul film.',starters:['Titlul ar fi „…”, pentru că…','O comedie numită „…”','O aventură cu titlul „…”']},
 {title:'Următoarea aventură',icon:'↗',theme:'adventure',caption:'Unde ne duce următorul „hai să…”?',starters:['Hai să mergem împreună la…','Aș vrea să încercăm…','O zi perfectă cu noi ar începe cu…']},
 {title:'Un mesaj pentru 18 ani',icon:'✉',theme:'future',caption:'Cuvintele de azi. Un zâmbet de peste ani.',starters:['Dragă Antonia de 18 ani,…','Sper că încă…','Când citești asta, să-ți amintești că…']}
];
let cardOpen=false;
function jumpTo(target){if(busy)return;capture();if(!draft.name.trim()){$('form-error').textContent='Scrie mai întâi numele tău.';return;}step=target;renderWizard();}
function renderWizard(){
 const out=$('wizard-content');out.replaceChildren();$('wizard').dataset.view=step>0&&step<=5?'question':step===0?'name':'review';$('next').hidden=step>0&&step<=5;out.dataset.step=String(step);$('form-error').textContent='';$('progress').replaceChildren();for(let i=0;i<7;i++)$('progress').append(node('span',undefined,i<=step?'done':''));$('back').hidden=step===0;$('next').textContent=step===6?'Trimite steaua ✧':'Continuă →';cardOpen=step===0||step===6;
 out.classList.remove('step-arrive');void out.offsetWidth;out.classList.add('step-arrive');
 if(step===0){const title=node('h2','Mai întâi, cine luminează cerul?');title.id='wizard-title';out.append(title,node('p','Scrie-ți numele, alege o culoare și lasă cinci gânduri pentru Antonia.','helper'));const l=node('label','Numele tău');l.htmlFor='name-input';const input=node('input');input.id='name-input';input.maxLength=40;input.autocomplete='given-name';input.placeholder='Prenume sau poreclă';input.value=draft.name;input.required=true;input.oninput=()=>{draft.name=input.value;saveDraft();};out.append(l,input,node('label','Alege culoarea stelei tale'));const colors=node('div',undefined,'colors');C.COLORS.forEach((color,i)=>{const b=node('button');b.type='button';b.className='color';b.style.setProperty('--swatch',color);b.setAttribute('aria-label',['Auriu','Turcoaz','Liliachiu','Roz','Albastru'][i]);b.setAttribute('aria-pressed',color===draft.color);b.onclick=()=>{draft.color=color;saveDraft();colors.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));};colors.append(b);});out.append(colors);}
 else if(step<=5){
  const i=step-1,chapter=CHAPTERS[i];out.append(node('div',`CAPITOLUL ${step} DIN 5 · ${chapter.title.toLocaleUpperCase('ro')}`,'step-caption'));
  const card=node('section',undefined,'question-card theme-'+chapter.theme);const rotor=node('div',undefined,'card-rotor');const front=node('div',undefined,'card-face card-front'),back=node('div',undefined,'card-face card-back');
  const token=node('div',undefined,'question-token');token.append(node('span',chapter.icon,'token-symbol'),node('span','','token-edge'));front.append(token,node('div','PENTRU ANTONIA','card-dedication'),node('h3',chapter.title),node('p',chapter.caption));
  const reveal=node('button','Deschide întrebarea ✧','open-question');reveal.type='button';front.append(reveal);
  const title=node('h2',C.QUESTIONS[i]);title.id='wizard-title';back.append(title,node('p',hints[i],'helper'));const label=node('label','Gândul tău');label.htmlFor='answer-input';const input=node('textarea');input.id='answer-input';input.maxLength=500;input.placeholder='Scrie cu cuvintele tale…';input.value=draft.answers[i];const count=node('div',`${input.value.length}/500`,'char-count');
  input.oninput=()=>{draft.answers[i]=input.value;count.textContent=`${input.value.length}/500`;saveDraft();};
  const inspire=node('button','✧ O scânteie de inspirație','inspire-button');inspire.type='button';inspire.setAttribute('aria-expanded','false');const ideas=node('div',undefined,'inspiration-chips');ideas.hidden=true;chapter.starters.forEach(text=>{const b=node('button',text);b.type='button';b.onclick=()=>{const current=input.value;const extra=(current.trim()?'\n':'')+text;if(current.length+extra.length>500){toast('Păstrează răspunsul în limita de 500 de caractere.');return;}input.value=current+extra;input.dispatchEvent(new Event('input'));input.focus({preventScroll:true});};ideas.append(b);});inspire.onclick=()=>{ideas.hidden=!ideas.hidden;inspire.setAttribute('aria-expanded',String(!ideas.hidden));};
  const skip=node('button','Las acest gând pentru altădată →','quiet skip');skip.type='button';skip.onclick=()=>{draft.answers[i]='';saveDraft();step++;renderWizard();};back.append(label,input,count,inspire,ideas,skip);back.setAttribute('inert','');
  function unfold(){if(cardOpen)return;cardOpen=true;$('next').hidden=false;if(reducedMotion.matches)card.classList.add('is-open');else requestAnimationFrame(()=>requestAnimationFrame(()=>{if(card.isConnected)card.classList.add('is-open');}));front.setAttribute('inert','');front.setAttribute('aria-hidden','true');back.removeAttribute('inert');$('next').textContent=step===5?'Vezi steaua completă →':'Următorul gând →';}
  reveal.onclick=unfold;rotor.append(front,back);card.append(rotor);out.append(card);$('next').textContent='Deschide întrebarea ✧';
 }
 else {const title=node('h2','Cinci gânduri. O stea doar a ta.');title.id='wizard-title';out.append(title,node('p',`${draft.name}, așa va arăta amintirea ta pentru Antonia.`,'helper'));draft.answers.forEach((a,i)=>{const section=node('div',undefined,'answer');section.append(node('h4',C.QUESTIONS[i]),node('p',a||'Întrebare sărită'));const edit=node('button','Editează ↗','review-edit');edit.type='button';edit.onclick=()=>jumpTo(i+1);section.append(edit);out.append(section);});out.append(node('div',isLive?'Numele și răspunsurile tale vor putea fi citite de sărbătorită și de persoanele care au linkul. Apăsând „Trimite steaua”, alegi să le adaugi în univers.':'Aceasta este o probă: steaua va fi păstrată numai în acest browser. Niciun mesaj nu este trimis sărbătoritei.','consent'));}
 $('wizard').scrollTop=0;
}
async function flyIntoUniverse(value){
 $('wizard').close();await refresh();if(!stars.some(s=>s.id===value.id)){stars.push(value);renderSky();}if(!$('universe').open)openDialog($('universe'));
 const index=stars.findIndex(s=>s.id===value.id);const p=C.position(value.id,Math.max(0,index),stars.length);
 const destination=Array.from($('stars').children).find(e=>e.dataset.starId===value.id);
 const flyer=node('div','✦','sky-launch');flyer.setAttribute('aria-hidden','true');flyer.style.setProperty('--landing-x',p.x+'%');flyer.style.setProperty('--landing-y',p.y+'%');flyer.style.setProperty('--launch-color',value.color);
 const message=node('div','Acum faci parte din universul Antoniei.','launch-note');message.setAttribute('role','status');
 if(destination)destination.classList.add('arrival-target');$('sky').append(flyer,message);
 await new Promise(resolve=>setTimeout(resolve,reducedMotion.matches?0:1200));flyer.remove();if(destination){destination.classList.remove('arrival-target');destination.classList.add('just-arrived');}celebrate(value.color);setTimeout(()=>message.remove(),4200);
}
$('star-form').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;if(step>0&&step<=5&&!cardOpen)return;capture();if(step===0&&!draft.name.trim()){$('form-error').textContent='Scrie numele tău ca să continuăm.';return;}
 if(step<6){step++;renderWizard();return;}
 const error=C.validate(draft);if(error){$('form-error').textContent=error;return;}
 busy=true;$('next').disabled=true;$('back').disabled=true;$('next').textContent='Se aprinde steaua…';const value=C.normalize(draft);
 try{
   if(isLive){await rpc('universe_add',{p_event:config.eventId,p_id:value.id,p_name:value.name,p_color:value.color,p_answers:value.answers});}
   else {const next=[...stars.filter(s=>s.id!==value.id),value];if(!storageWrite(key+':stars',next))throw new Error('local');}
   if(!stars.some(s=>s.id===value.id))stars.push(value);renderSky();storageRemove(key+':draft');celebrate(value.color);
   await flyIntoUniverse(value);toast(isLive?'Acum faci parte din universul Antoniei. ✧':'Stea demonstrativă salvată local. ✧');
 }catch(e){$('form-error').textContent=e.message==='local'?'Browserul nu a putut salva steaua. Cuvintele tale sunt încă în formular.':'Steaua nu a fost confirmată de server. Verifică internetul și încearcă din nou. Cuvintele tale au rămas în formular.';}
 finally{busy=false;$('next').disabled=false;$('back').disabled=false;$('next').textContent='Trimite steaua ✧';}
});
$('start').onclick=()=>{$('next').hidden=false;start();};$('explore').onclick=()=>{openDialog($('universe'));refresh();};$('back').onclick=()=>{capture();step=Math.max(0,step-1);renderWizard();};
for(const d of document.querySelectorAll('dialog')){d.querySelector('[data-close]').onclick=()=>{if(!busy)d.close();};d.addEventListener('cancel',e=>{if(busy)e.preventDefault();});}
$('random').onclick=()=>{if(stars.length)connectStar(stars[Math.floor(Math.random()*stars.length)]);};$('directory').onclick=()=>{renderDirectory();openDialog($('guests'));};$('search').oninput=renderDirectory;
$('share').onclick=async()=>{if(location.protocol==='file:'){toast('Copiază linkul după publicarea pe GitHub Pages.');return;}try{await navigator.clipboard.writeText(location.href.split('#')[0]);toast('Link copiat. Trimite-l prietenilor sau folosește-l pentru QR.');}catch{toast('Copiază adresa site-ului din bara browserului.');}};
let pdfLibraryPromise=null;
function loadPdfLibrary(){if(window.jspdf)return Promise.resolve(window.jspdf);if(!pdfLibraryPromise)pdfLibraryPromise=new Promise((resolve,reject)=>{const script=node('script');script.src='assets/vendor/jspdf.umd.min.js';script.onload=()=>resolve(window.jspdf);script.onerror=()=>{pdfLibraryPromise=null;script.remove();reject(new Error('pdf-library'));};document.head.append(script);});return pdfLibraryPromise;}
async function fetchBytes(path){const r=await fetch(path,{cache:'force-cache'});if(!r.ok)throw new Error('pdf-asset');return new Uint8Array(await r.arrayBuffer());}
function base64(bytes){let str='';for(let i=0;i<bytes.length;i+=8192)str+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(str);}
async function downloadAlbum(){
 const button=$('poster');if(button.disabled)return;button.disabled=true;button.textContent='Se pregătește albumul…';
 try{
 const snapshot=isLive?(await rpc('universe_list',{p_event:config.eventId})).filter(validRecord):[...stars];
 if(isLive){stars=snapshot;hasLoaded=true;renderSky();}
 const [library,font,photo]=await Promise.all([loadPdfLibrary(),fetchBytes('assets/fonts/DejaVuSans.ttf'),fetchBytes('assets/antonia-album.jpg')]);
 const doc=window.AntoniaAlbum.buildAlbum({jsPDF:library.jsPDF,stars:snapshot,questions:C.QUESTIONS,position:C.position,fontBase64:base64(font),photoBytes:photo,name:config.birthdayName||'Antonia',demo:!isLive||qaMode});
 doc.save('Album-Antonia-14-ani.pdf');toast(`Album pregătit: ${snapshot.length} invitați, cu toate mesajele încărcate.`);
 }catch(e){toast('Albumul nu a putut fi generat. Verifică internetul și încearcă din nou.');}
 finally{button.disabled=false;button.textContent='↓ Descarcă albumul PDF';}
}
$('poster').onclick=downloadAlbum;$('book').onclick=downloadAlbum;
})();
