const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const good=()=>({id:'abc',name:'Ștefania',color:C.COLORS[0],answers:['Un vis','','','','']});
test('întrebările păstrează formularea aprobată',()=>{assert.equal(C.QUESTIONS.length,5);assert.equal(C.QUESTIONS[0],'Ce vis îmi dorești să-mi îndeplinesc?');assert.match(C.QUESTIONS[4],/18 ani/);});
test('permite sărituri, dar refuză o stea fără niciun mesaj',()=>{assert.equal(C.validate(good()),'');const v=good();v.answers.fill('   ');assert.notEqual(C.validate(v),'');});
test('respinge nume gol, răspuns prea lung și date corupte',()=>{for(const change of [{name:' '},{name:'a'.repeat(41)},{answers:['a'.repeat(501),'','','','']},{answers:[null,'','','','']},{color:'red'},{answers:[]}])assert.notEqual(C.validate({...good(),...change}),'');assert.notEqual(C.validate(null),'');});
test('păstrează diacriticele și elimină spațiile exterioare',()=>{assert.equal(C.normalize({...good(),name:'  Ștefania  '}).name,'Ștefania');});
test('pozițiile sunt deterministe și în interiorul cerului',()=>{for(let n=1;n<=200;n++){const p=C.position('guest-'+n,n-1,n);assert.ok(p.x>=10&&p.x<=90&&p.y>=13&&p.y<=85);assert.deepEqual(p,C.position('guest-'+n,n-1,n));}});
