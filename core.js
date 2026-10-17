(function(root) {
  'use strict';
  const QUESTIONS = [
    'Ce vis îmi dorești să-mi îndeplinesc?',
    'Ce lucru îți place cel mai mult la mine?',
    'Dacă prietenia noastră ar avea un titlu de film, cum s-ar numi?',
    'Ce aventură ai vrea să trăim împreună?',
    'Ce mesaj vrei să-mi lași pentru ziua în care voi împlini 18 ani?'
  ];
  const COLORS = ['#f7d58b', '#82e1d1', '#c2a8f5', '#f4a9c0', '#a1c8ff'];
  function hash(value) { let n=2166136261; for(const c of value) n=Math.imul(n^c.charCodeAt(0),16777619); return n>>>0; }
  function position(id, index, count) {
    const h=hash(String(id));
    const angle=index*2.3999632297+(h%20)/100;
    const radius=Math.sqrt((index+0.7)/(count+0.7));
    return {x:50+Math.cos(angle)*radius*40,y:49+Math.sin(angle)*radius*36};
  }
  function validate(d) {
    if(!d || typeof d.name!=='string' || !d.name.trim() || d.name.trim().length>40) return 'Scrie un nume de maximum 40 de caractere.';
    if(!COLORS.includes(d.color)) return 'Alege culoarea stelei.';
    if(!Array.isArray(d.answers)||d.answers.length!==5||d.answers.some(a=>typeof a!=='string'||a.length>500)) return 'Fiecare răspuns poate avea cel mult 500 de caractere.';
    if(!d.answers.some(a=>a.trim())) return 'Lasă cel puțin un răspuns pentru sărbătorită.';
    return '';
  }
  function normalize(d) { return {id:d.id, name:d.name.trim(),color:d.color,answers:d.answers.map(a=>a.trim())}; }
  const api={QUESTIONS,COLORS,position,validate,normalize};
  if(typeof module!=='undefined'&&module.exports)module.exports=api; else root.UniverseCore=api;
})(globalThis);
