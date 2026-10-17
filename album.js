(function(root){
'use strict';
function buildAlbum({jsPDF,stars,questions,position,fontBase64,photoBytes,name='Antonia',demo=false}){
 const d=new jsPDF({unit:'mm',format:'a4',compress:true});
 d.addFileToVFS('Memories.ttf',fontBase64);d.addFont('Memories.ttf','Memories','normal');d.setFont('Memories','normal');
 d.setProperties({title:`Universul ${name} - Album de amintiri`,author:'Prietenii Antoniei',subject:'14 ani de magie'});
 const navy='#081621',gold='#e5bd73',ink='#1a3543',muted='#607784';
 function text(s,x,y,size=11,color=ink,options={}){d.setFont('Memories','normal');d.setFontSize(size);d.setTextColor(color);d.text(String(s).normalize('NFC'),x,y,options);}
 function star(x,y,r,color){const points=[];for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,rad=i%2?r*.28:r;points.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad]);}const segments=points.slice(1).map((p,i)=>[p[0]-points[i][0],p[1]-points[i][1]]);d.setFillColor(color);d.lines(segments,points[0][0],points[0][1],[1,1],'F',true);}
 function portrait(x,y,r){d.saveGraphicsState();d.circle(x,y,r,null);d.clip();d.discardPath();d.addImage(photoBytes,'JPEG',x-r,y-r,2*r,2*r);d.restoreGraphicsState();d.setDrawColor(gold);d.setLineWidth(.45);d.circle(x,y,r+.8);}
 // Cover: portrait and the same constellation as the interactive universe.
 d.setFillColor(navy);d.rect(0,0,210,297,'F');text('O MICĂ INFINITATE',105,25,9,gold,{align:'center'});text(name,105,48,30,'#edf1ef',{align:'center'});text('14 ani de magie',105,61,13,gold,{align:'center'});text(stars.length===1?'O stea. O poveste de păstrat.':`${stars.length} stele. Tot atâtea povești de păstrat.`,105,77,9,'#a6bbc7',{align:'center'});
 d.setDrawColor('#25434f');d.setLineWidth(.2);d.ellipse(105,172,78,55);d.ellipse(105,172,62,67);
 const positions=stars.map((s,i)=>{const p=position(s.id,i,stars.length);return {x:20+p.x*1.7,y:96+p.y*1.53};});
 d.setDrawColor('#2a4852');positions.forEach((p,i)=>{if(i)d.line(positions[i-1].x,positions[i-1].y,p.x,p.y);});portrait(105,171,18);
 positions.forEach((p,i)=>{star(p.x,p.y,stars.length>50?1:2.1,stars[i].color);if(stars.length<=50)text(stars[i].name,p.x,p.y+5,stars.length>25?4.2:6.3,'#edf1ef',{align:'center',maxWidth:32});});
 text('Unele stele sunt oameni.',105,261,14,gold,{align:'center'});text('Gândurile prietenilor, adunate pentru Antonia.',105,272,9,'#b8cad2',{align:'center'});if(demo)text('ALBUM DEMONSTRATIV',105,284,7,'#b8cad2',{align:'center'});
 let y=0;
 function page(s,continuation){d.addPage();d.setFillColor('#faf8f3');d.rect(0,0,210,297,'F');d.setDrawColor(s.color);d.setLineWidth(1);d.line(20,18,190,18);text('UNIVERSUL ANTONIEI  /  UN MESAJ PENTRU TINE',20,28,7,muted);star(23,42,3,s.color);const names=d.splitTextToSize(s.name,150);text(names,32,43,20,ink);y=46+names.length*8;if(continuation){text('Povestea continuă...',20,y,8,muted);y+=10;}else{y+=5;} }
 for(const s of stars){page(s,false);questions.forEach((q,i)=>{d.setFontSize(9);const qLines=d.splitTextToSize(`${i+1}. ${q}`,170);if(y+qLines.length*4.8+15>274)page(s,true);text(qLines,20,y,9,muted);y+=qLines.length*4.8+4;d.setFontSize(11);const lines=d.splitTextToSize(s.answers[i]||'Un gând rămas printre stele.',170);for(const line of lines){if(y>274){page(s,true);text(`Răspunsul ${i+1} (continuare)`,20,y,8,muted);y+=9;}text(line,20,y,11,ink);y+=5.7;}y+=12;});}
 const total=d.getNumberOfPages();for(let i=1;i<=total;i++){d.setPage(i);text(`${i} / ${total}`,190,289,7,i===1?'#a6bbc7':muted,{align:'right'});if(i>1)text('Antonia - 14 ani de magie',20,289,7,muted);}
 return d;
}
const api={buildAlbum};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AntoniaAlbum=api;
})(globalThis);
