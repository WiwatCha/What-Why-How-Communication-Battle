const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();
const prompts = [
  'ลิฟต์บริษัทประกาศว่าจะหยุดทุกชั้น ยกเว้นชั้นที่มีคนเอาขนมมาแจก คุณต้องเสนอวิธีแก้',
  'แมวประจำออฟฟิศได้รับแต่งตั้งเป็น Project Manager และเริ่มเรียกประชุมทุก 15 นาที',
  'เครื่องชงกาแฟส่งอีเมลทวง KPI และขู่ว่าจะหยุดทำงานหากไม่มีแผนปรับปรุง',
  'CEO ขอให้ลดเวลาประชุมลง 80% แต่ทุกคนขอประชุมเพื่อหารือว่าจะลดประชุมอย่างไร',
  'AI เขียนรายงานได้เร็วมาก แต่ใส่อีโมจิรูปเป็ดท้ายทุกประโยค คุณต้องตัดสินใจว่าจะใช้ต่อหรือไม่',
  'ทีมค้นพบว่ารายงาน 42 หน้า สรุปจริงได้ด้วยประโยคเดียว แต่เจ้าของรายงานภูมิใจมาก',
  'ลูกค้าขอเคลมความเสียหายจากมนุษย์ต่างดาว ทั้งที่กรมธรรม์ไม่ได้เขียนเรื่องดาวเคราะห์',
  'ระบบใหม่เร็วกว่าเดิม 10 เท่า แต่ต้องกดปุ่มยืนยัน 37 ครั้งก่อนเริ่มใช้งาน',
  'พนักงานทุกคนเปลี่ยนรูปโปรไฟล์เป็นมันฝรั่ง ทำให้ HR จำใครไม่ได้',
  'ห้องประชุมอัจฉริยะล็อกประตูและไม่ยอมปล่อยทุกคนออก จนกว่าจะได้ Action Item ที่ชัดเจน',
  'ฝ่ายการเงินอนุมัติงบซื้อเก้าอี้เกมมิ่ง แต่ไม่อนุมัติงบซ่อมระบบหลัก',
  'บอทตอบลูกค้าสุภาพมาก แต่ตอบทุกคำถามว่า ขออนุญาตตรวจสอบแล้วจะกลับมาใน 300 วัน',
  'ผู้บริหารขอ Dashboard แบบเรียลไทม์ แต่ข้อมูลต้นทางอัปเดตปีละครั้ง',
  'ทีมยอดเยี่ยมเรื่องการเริ่มโครงการ แต่ไม่มีใครเคยเห็นโครงการไหนจบ',
  'วันจันทร์ถูกยกเลิกทั่วโลก บริษัทต้องออกแบบสัปดาห์ทำงานใหม่ภายใน 60 วินาที'
];
function code(){ return crypto.randomBytes(3).toString('hex').toUpperCase(); }
function state(r){ return {code:r.code, hostId:r.hostId, players:[...r.players.values()].map(p=>({id:p.id,name:p.name,score:p.score})), phase:r.phase, round:r.round, prompt:r.prompt, speakerId:r.speakerId, timerEnd:r.timerEnd, order:r.order}; }
function emit(r){ io.to(r.code).emit('state', state(r)); }
function nextRound(r){
  r.round++; r.phase='prepare'; r.prompt=prompts[Math.floor(Math.random()*prompts.length)];
  r.order=[...r.players.keys()].sort(()=>Math.random()-.5); r.speakerIndex=-1; r.speakerId=null;
  r.timerEnd=Date.now()+30000; emit(r);
  clearTimeout(r.timer); r.timer=setTimeout(()=>nextSpeaker(r),30000);
}
function nextSpeaker(r){
  r.speakerIndex++;
  if(r.speakerIndex>=r.order.length){ r.phase='results'; r.speakerId=null; r.timerEnd=null; emit(r); return; }
  r.phase='speak'; r.speakerId=r.order[r.speakerIndex]; r.timerEnd=Date.now()+60000; r.votes=new Map(); emit(r);
  clearTimeout(r.timer); r.timer=setTimeout(()=>finishSpeaker(r),60000);
}
function finishSpeaker(r){ r.phase='vote'; r.timerEnd=Date.now()+15000; emit(r); clearTimeout(r.timer); r.timer=setTimeout(()=>scoreVotes(r),15000); }
function scoreVotes(r){
  const vals=[...r.votes.values()];
  if(vals.length){ const pts=Math.round(vals.reduce((s,v)=>s+v.what+v.why+v.how+v.fun,0)/vals.length); const p=r.players.get(r.speakerId); if(p) p.score+=pts; }
  nextSpeaker(r);
}
io.on('connection', socket=>{
  socket.on('create', ({name},cb)=>{ let c=code(); while(rooms.has(c)) c=code(); const r={code:c,hostId:socket.id,players:new Map(),phase:'lobby',round:0,prompt:'',speakerId:null,timerEnd:null,order:[],timer:null}; r.players.set(socket.id,{id:socket.id,name:(name||'หัวหน้าฝึกหัด').slice(0,24),score:0}); rooms.set(c,r); socket.join(c); socket.data.room=c; cb({ok:true,code:c}); emit(r); });
  socket.on('join', ({code:c,name},cb)=>{ c=(c||'').toUpperCase(); const r=rooms.get(c); if(!r) return cb({ok:false,msg:'ไม่พบห้องนี้'}); if(r.phase!=='lobby') return cb({ok:false,msg:'เกมเริ่มแล้ว รอรอบหน้า'}); if(r.players.size>=12) return cb({ok:false,msg:'ห้องเต็มแล้ว'}); r.players.set(socket.id,{id:socket.id,name:(name||'นักเล่าเรื่องลึกลับ').slice(0,24),score:0}); socket.join(c); socket.data.room=c; cb({ok:true,code:c}); emit(r); });
  socket.on('start',()=>{ const r=rooms.get(socket.data.room); if(r&&r.hostId===socket.id&&r.players.size>=2) nextRound(r); });
  socket.on('readySpeak',()=>{ const r=rooms.get(socket.data.room); if(r&&r.hostId===socket.id&&r.phase==='prepare') nextSpeaker(r); });
  socket.on('finishSpeak',()=>{ const r=rooms.get(socket.data.room); if(r&&r.phase==='speak'&&(socket.id===r.speakerId||socket.id===r.hostId)) finishSpeaker(r); });
  socket.on('vote',(v)=>{ const r=rooms.get(socket.data.room); if(r&&r.phase==='vote'&&socket.id!==r.speakerId) r.votes.set(socket.id,{what:+v.what,why:+v.why,how:+v.how,fun:+v.fun}); });
  socket.on('nextRound',()=>{ const r=rooms.get(socket.data.room); if(r&&r.hostId===socket.id&&r.phase==='results') nextRound(r); });
  socket.on('disconnect',()=>{ const r=rooms.get(socket.data.room); if(!r)return; r.players.delete(socket.id); if(!r.players.size){clearTimeout(r.timer);rooms.delete(r.code);return;} if(r.hostId===socket.id)r.hostId=[...r.players.keys()][0]; emit(r); });
});
app.get('/health',(req,res)=>res.send('ok'));
server.listen(process.env.PORT||3000,()=>console.log('POINT! listening'));
