const express=require('express');const http=require('http');const{Server}=require('socket.io');const path=require('path');const crypto=require('crypto');
const app=express(),server=http.createServer(app),io=new Server(server,{cors:{origin:'*'}});app.use(express.static(path.join(__dirname,'public')));
const rooms=new Map();
const prompts=[
'หัวหน้าบอกว่าตั้งแต่พรุ่งนี้ ทุกประชุมต้องจบภายใน 15 นาที คุณจะบอกทีมว่าอย่างไร',
'คุณมาสายเพราะลิฟต์หยุดทุกชั้น และต้องอธิบายให้หัวหน้าฟังภายใน 1 นาที',
'เครื่องชงกาแฟเสียในเช้าวันจันทร์ ทุกคนเริ่มหมดพลัง คุณจะเสนอทางออกอย่างไร',
'ทีมทำงานเสร็จแล้ว แต่ไม่มีใครกล้ากดส่งให้ลูกค้า คุณจะคุยกับทีมว่าอย่างไร',
'มีประชุม 3 ชั่วโมง แต่สุดท้ายได้ข้อสรุปเพียง 1 ข้อ คุณจะเสนอให้ปรับอย่างไร',
'ระบบใหม่เร็วขึ้นมาก แต่พนักงานไม่อยากใช้เพราะเมนูเยอะเกินไป คุณจะอธิบายปัญหาอย่างไร',
'เพื่อนร่วมทีมส่งข้อความว่า ด่วนมาก แต่หายไปกินข้าว 2 ชั่วโมง คุณจะจัดการเรื่องนี้อย่างไร',
'ผู้บริหารถามว่า ทำไมโครงการนี้ช้ากว่าแผน 2 สัปดาห์ คุณมีเวลาอธิบาย 1 นาที',
'ลูกค้าโทรมาต่อว่าเพราะรอนาน คุณต้องอธิบายสถานการณ์และวิธีแก้ให้หัวหน้าฟัง',
'ทุกคนในทีมคิดว่างานหนึ่งชิ้นเป็นหน้าที่ของคนอื่น จนไม่มีใครทำ คุณจะพูดกับทีมว่าอย่างไร',
'บริษัทประกาศห้ามใช้คำว่า เดี๋ยวก่อน ในการทำงาน 1 วัน คุณจะช่วยทีมรับมืออย่างไร',
'ไฟดับก่อนนำเสนองาน 5 นาที และไฟล์อยู่ในคอมพิวเตอร์ คุณจะบอกทีมให้ทำอะไร',
'CEO เดินเข้าลิฟต์พร้อมคุณและถามว่า โครงการที่คุณทำช่วยบริษัทอย่างไร คุณมีเวลา 30 วินาที',
'ทีมได้รับงบซื้อของได้เพียง 1 อย่าง ระหว่างเก้าอี้ใหม่กับคอมพิวเตอร์ใหม่ คุณจะเสนออะไรและเพราะอะไร',
'AI ช่วยทำงานเร็วขึ้น แต่ตอบผิดบ้าง คุณจะอธิบายให้ทีมรู้ว่าควรใช้อย่างไร',
'เพื่อนเสนอให้จัดประชุมเพื่อเตรียมประชุมอีกครั้ง คุณจะตอบอย่างไร',
'ลูกค้าขอสิ่งที่บริษัททำให้ไม่ได้ คุณจะอธิบายเรื่องนี้แบบสั้นและชัดอย่างไร',
'หัวหน้าถามว่า วันนี้คุณทำอะไรสำเร็จบ้าง แต่คุณมีเวลาตอบเพียง 30 วินาที',
'ทีมมีงานด่วนเข้ามา 3 งานพร้อมกัน คุณจะบอกทีมว่าจะจัดลำดับอย่างไร',
'วันศุกร์เวลา 16:55 มีคนส่งงานด่วนและขอคำตอบวันนี้ คุณจะตอบและจัดการอย่างไร'
];
const botNames=['น้องตรงประเด็น 3000','บอทไม่อ้อมค้อม','AI สายประชุมสั้น','คุณเป็ด Executive'];
function roomCode(){return crypto.randomBytes(3).toString('hex').toUpperCase()}function publicState(r){return{code:r.code,hostId:r.hostId,players:[...r.players.values()],phase:r.phase,round:r.round,prompt:r.prompt,speakerId:r.speakerId,timerEnd:r.timerEnd,botSpeech:r.botSpeech||''}}function emit(r){io.to(r.code).emit('state',publicState(r))}
function makeBotSpeech(prompt){const options=[`WHAT: ปัญหาคือ ${prompt} WHY: ถ้าปล่อยไว้ ทีมจะเสียเวลาและลูกค้าอาจสับสน HOW: ตั้งกติกาใหม่ ทดลอง 7 วัน แล้ววัดผลก่อนใช้จริง`,`WHAT: เราต้องหยุดสถานการณ์นี้ก่อนจะกลายเป็นวาระแห่งชาติ WHY: เพราะตอนนี้งานช้าลงและคนเริ่มโทษเครื่องชงกาแฟ HOW: แต่งตั้งเจ้าของเรื่องหนึ่งคน แก้สาเหตุหลัก และรายงานผลพรุ่งนี้`,`WHAT: ประเด็นนี้ตลกแต่กระทบงานจริง WHY: ทีมกำลังใช้เวลาแก้ปลายเหตุแทนสร้างคุณค่า HOW: ลดขั้นตอนที่ไม่จำเป็น ทดสอบทางออกเล็กๆ และขยายเมื่อผลดี`];return options[Math.floor(Math.random()*options.length)]}
function nextRound(r){r.round++;r.phase='prepare';r.prompt=prompts[Math.floor(Math.random()*prompts.length)];r.order=[...r.players.keys()].sort(()=>Math.random()-.5);r.speakerIndex=-1;r.speakerId=null;r.botSpeech='';r.timerEnd=Date.now()+45000;emit(r);clearTimeout(r.timer);r.timer=setTimeout(()=>nextSpeaker(r),45000)}
function nextSpeaker(r){r.speakerIndex++;if(r.speakerIndex>=r.order.length){r.phase='results';r.speakerId=null;r.timerEnd=null;emit(r);return}r.speakerId=r.order[r.speakerIndex];r.phase='think';r.botSpeech='';r.timerEnd=Date.now()+30000;emit(r);clearTimeout(r.timer);r.timer=setTimeout(()=>beginSpeak(r),30000)}
function beginSpeak(r){const p=r.players.get(r.speakerId);if(!p)return nextSpeaker(r);r.phase='speak';r.botSpeech=p.bot?makeBotSpeech(r.prompt):'';r.timerEnd=Date.now()+(p.bot?9000:60000);r.votes=new Map();emit(r);clearTimeout(r.timer);r.timer=setTimeout(()=>finishSpeaker(r),p.bot?9000:60000)}
function finishSpeaker(r){r.phase='vote';r.timerEnd=Date.now()+15000;emit(r);clearTimeout(r.timer);r.timer=setTimeout(()=>scoreVotes(r),15000)}
function scoreVotes(r){const p=r.players.get(r.speakerId),vals=[...r.votes.values()];if(p){let pts;if(p.bot&&vals.length===0)pts=12+Math.floor(Math.random()*7);else if(vals.length)pts=Math.round(vals.reduce((s,v)=>s+v.what+v.why+v.how+v.fun,0)/vals.length);else pts=0;p.score+=pts}nextSpeaker(r)}
io.on('connection',socket=>{socket.on('create',({name,solo},cb)=>{let c=roomCode();while(rooms.has(c))c=roomCode();const r={code:c,hostId:socket.id,players:new Map(),phase:'lobby',round:0,prompt:'',speakerId:null,timerEnd:null,order:[],timer:null};r.players.set(socket.id,{id:socket.id,name:(name||'หัวหน้าฝึกหัด').slice(0,24),score:0,bot:false});if(solo){const id='bot-'+crypto.randomBytes(4).toString('hex');r.players.set(id,{id,name:botNames[Math.floor(Math.random()*botNames.length)],score:0,bot:true})}rooms.set(c,r);socket.join(c);socket.data.room=c;cb({ok:true,code:c});emit(r)});socket.on('join',({code,name},cb)=>{const r=rooms.get((code||'').toUpperCase());if(!r)return cb({ok:false,msg:'ไม่พบห้องนี้'});if(r.phase!=='lobby')return cb({ok:false,msg:'เกมเริ่มแล้ว'});if(r.players.size>=12)return cb({ok:false,msg:'ห้องเต็มแล้ว'});r.players.set(socket.id,{id:socket.id,name:(name||'นักเล่าเรื่องลึกลับ').slice(0,24),score:0,bot:false});socket.join(r.code);socket.data.room=r.code;cb({ok:true,code:r.code});emit(r)});socket.on('addBot',()=>{const r=rooms.get(socket.data.room);if(!r||r.hostId!==socket.id||r.phase!=='lobby'||r.players.size>=12)return;const id='bot-'+crypto.randomBytes(4).toString('hex');r.players.set(id,{id,name:botNames[Math.floor(Math.random()*botNames.length)]+' '+(r.players.size),score:0,bot:true});emit(r)});socket.on('start',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.players.size>=2)nextRound(r)});socket.on('readySpeak',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='prepare')nextSpeaker(r)});socket.on('finishSpeak',()=>{const r=rooms.get(socket.data.room);if(r&&r.phase==='speak'&&(socket.id===r.speakerId||socket.id===r.hostId))finishSpeaker(r)});socket.on('vote',v=>{const r=rooms.get(socket.data.room);if(r&&r.phase==='vote'&&socket.id!==r.speakerId)r.votes.set(socket.id,{what:+v.what,why:+v.why,how:+v.how,fun:+v.fun})});socket.on('nextRound',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='results')nextRound(r)});socket.on('disconnect',()=>{const r=rooms.get(socket.data.room);if(!r)return;r.players.delete(socket.id);if(![...r.players.values()].some(p=>!p.bot)){clearTimeout(r.timer);rooms.delete(r.code);return}if(r.hostId===socket.id)r.hostId=[...r.players.values()].find(p=>!p.bot).id;emit(r)})});
app.get('/health',(q,s)=>s.send('ok'));server.listen(process.env.PORT||3000,()=>console.log('POINT ULTIMATE ready'));
