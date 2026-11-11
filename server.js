const express=require('express');
const http=require('http');
const path=require('path');
const crypto=require('crypto');
const {Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*'}});
app.use(express.static(path.join(__dirname,'public')));
const keywordSets=[
['CEO','ไก่ทอด','ลิฟต์','วันจันทร์'],['มนุษย์ต่างดาว','เคลมประกัน','ร่ม','ด่วน'],['แมว','ผู้จัดการโครงการ','เส้นตาย','นอน'],['กาแฟ','AI','โบนัส','ลาออก'],['PowerPoint','UFO','ประชุม','หิว'],['กล้วย','งบประมาณ','IT','ห้าล้านบาท'],['แม่บ้าน','AI','เลื่อนตำแหน่ง','ผิดคน'],['ไดโนเสาร์','HR','ทำงานที่บ้าน','มาสาย'],['หมูกระทะ','CEO','KPI','ฝนตก'],['ห้องประชุม','ผี','งานที่ต้องทำ','เที่ยงคืน'],['Excel','ลิง','รหัสผ่าน','ตรวจสอบ'],['ลูกค้า','ซูเปอร์ฮีโร่','ใบแจ้งหนี้','หาย'],['เครื่องพิมพ์','ชานม','ความปลอดภัยไซเบอร์','วันศุกร์'],['หุ่นยนต์','ห้องน้ำ','อบรม','ไวรัล'],['มาม่า','กลยุทธ์','ประชุมบอร์ด','ไฟดับ'],['TikTok','เคลม','คุณยาย','หนึ่งล้านบาท'],['ทุเรียน','ข้อมูล','ผู้จัดการ','สนามบิน'],['นกพิราบ','อีเมลลับ','CEO','ส่งผิด'],['ช้าง','ประชุมออนไลน์','ไม่เปิดกล้อง','โบนัส'],['ลอตเตอรี่','Compliance','เด็กฝึกงาน','เครื่องถ่ายเอกสาร']
];
const rooms=new Map();
const BOT_NAMES=['น้องบอทสายตรง','คุณเอไอไม่อ้อมค้อม','บอทเล่าเกินจริง','โรบอทสามขั้น'];
function roomCode(){return crypto.randomBytes(3).toString('hex').toUpperCase()}
function botStory(k){
 const [a,b,c,d]=k;
 const variants=[
  {w:`เรื่องด่วนวันนี้คือ ${a} ติดอยู่กับ ${b} และถือ ${c} ไว้แน่นมาก`,y:`เหตุผลที่ทุกคนต้องสนใจ เพราะถ้า ${d} มาถึงก่อน เราอาจต้องตั้งคณะกรรมการสอบสวน ${b}`,h:`ทางออกคือให้ ${a} รับผิดชอบหนึ่งเรื่อง ให้ ${c} เป็นหลักฐาน แล้วปิดงานก่อนทุกคนขอประชุมเพิ่ม`},
  {w:`เกิดเหตุประหลาดเมื่อ ${a} ประกาศว่า ${b} คือทรัพย์สินสำคัญที่สุดของบริษัท`,y:`เรื่องนี้สำคัญเพราะ ${c} หายไปพร้อมกับ ${d} และไม่มีใครกล้ายอมรับว่าอ่านอีเมลไม่จบ`,h:`เราจะตามหา ${c} ก่อน จากนั้นให้ ${a} อธิบายต่อทีมภายในหนึ่งนาที และห้ามสร้าง PowerPoint เกินสามหน้า`},
  {w:`เช้าวันนี้ ${a} พบ ${b} อยู่กลางออฟฟิศ ข้างๆ มี ${c}`,y:`ถ้าไม่รีบแก้ ${d} จะกลายเป็นปัญหาระดับชาติ และฝ่ายการเงินอาจขอใบเสร็จจากดาวอังคาร`,h:`ขั้นแรกแยกคนออกจาก ${b} ขั้นต่อไปตรวจ ${c} และสุดท้ายให้ ${a} สรุปผลแบบ ว็อท วาย ฮาว ก่อนเที่ยง`}
 ];
 const v=variants[Math.floor(Math.random()*variants.length)];
 return {what:v.w,why:v.y,how:v.h,full:`ว็อท หรือเกิดอะไรขึ้น... ${v.w} ... วาย หรือทำไมต้องสนใจ... ${v.y} ... ฮาว หรือจะทำอย่างไร... ${v.h}`};
}
function publicState(r){return {code:r.code,hostId:r.hostId,players:[...r.players.values()],phase:r.phase,round:r.round,keywords:r.keywords,speakerId:r.speakerId,end:r.end,usedKeywords:r.usedKeywords,botStory:r.botStory,lastReaction:r.lastReaction,reactionSeq:r.reactionSeq}}
function emit(r){io.to(r.code).emit('state',publicState(r))}
function clearTimer(r){if(r.timer)clearTimeout(r.timer)}
function nextSpeaker(r){
 r.index++;
 if(r.index>=r.order.length){r.phase='results';r.speakerId=null;r.end=0;r.botStory=null;emit(r);return}
 r.speakerId=r.order[r.index];r.usedKeywords=[];r.botStory=null;
 const p=r.players.get(r.speakerId);
 if(p.bot){r.phase='botSpeak';r.botStory=botStory(r.keywords);r.usedKeywords=[...r.keywords];r.end=Date.now()+30000;emit(r);clearTimer(r);r.timer=setTimeout(()=>startVote(r),30000)}
 else {r.phase='think';r.end=Date.now()+30000;emit(r);clearTimer(r);r.timer=setTimeout(()=>startSpeak(r),30000)}
}
function startSpeak(r){r.phase='speak';r.end=Date.now()+60000;emit(r);clearTimer(r);r.timer=setTimeout(()=>startVote(r),60000)}
function startVote(r){r.phase='vote';r.end=Date.now()+10000;emit(r);clearTimer(r);r.timer=setTimeout(()=>nextSpeaker(r),10000)}
function addBot(r){if(r.players.size>=12)return;const id='bot-'+crypto.randomBytes(4).toString('hex');r.players.set(id,{id,name:BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)],score:0,bot:true})}
io.on('connection',socket=>{
 socket.on('createRoom',({name,withBot},cb)=>{try{let code=roomCode();while(rooms.has(code))code=roomCode();const r={code,hostId:socket.id,players:new Map(),phase:'lobby',round:0,keywords:[],speakerId:null,end:0,usedKeywords:[],botStory:null,lastReaction:null,reactionSeq:0,index:-1,order:[],timer:null};r.players.set(socket.id,{id:socket.id,name:(name||'นักเล่าเรื่อง').slice(0,24),score:0,bot:false});if(withBot)addBot(r);rooms.set(code,r);socket.join(code);socket.data.room=code;cb({ok:true,code});emit(r)}catch(e){cb({ok:false,message:'สร้างห้องไม่สำเร็จ'})}});
 socket.on('joinRoom',({name,code},cb)=>{const r=rooms.get(String(code||'').trim().toUpperCase());if(!r)return cb({ok:false,message:'ไม่พบรหัสห้อง'});if(r.phase!=='lobby')return cb({ok:false,message:'เกมเริ่มแล้ว'});if(r.players.size>=12)return cb({ok:false,message:'ห้องเต็ม'});r.players.set(socket.id,{id:socket.id,name:(name||'นักเล่าเรื่อง').slice(0,24),score:0,bot:false});socket.join(r.code);socket.data.room=r.code;cb({ok:true,code:r.code});emit(r)});
 socket.on('addBot',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='lobby'){addBot(r);emit(r)}});
 socket.on('startGame',()=>{const r=rooms.get(socket.data.room);if(!r||r.hostId!==socket.id||r.players.size<2)return;r.round++;r.keywords=keywordSets[Math.floor(Math.random()*keywordSets.length)];r.order=[...r.players.keys()].sort(()=>Math.random()-.5);r.index=-1;r.phase='read';r.end=Date.now()+45000;r.usedKeywords=[];r.botStory=null;emit(r);clearTimer(r);r.timer=setTimeout(()=>nextSpeaker(r),45000)});
 socket.on('readReady',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='read')nextSpeaker(r)});
 socket.on('speakerReady',()=>{const r=rooms.get(socket.data.room);if(r&&r.phase==='think'&&r.speakerId===socket.id)startSpeak(r)});
 socket.on('finishSpeak',()=>{const r=rooms.get(socket.data.room);if(r&&['speak','botSpeak'].includes(r.phase)&&(r.speakerId===socket.id||r.hostId===socket.id))startVote(r)});
 socket.on('coverage',({used})=>{const r=rooms.get(socket.data.room);if(r&&r.phase==='speak'&&r.speakerId===socket.id){r.usedKeywords=Array.isArray(used)?used.filter(k=>r.keywords.includes(k)):[];emit(r)}});
 socket.on('reaction',({kind})=>{const r=rooms.get(socket.data.room);if(!r||!['speak','botSpeak'].includes(r.phase)||r.speakerId===socket.id)return;r.reactionSeq++;r.lastReaction={seq:r.reactionSeq,kind:String(kind||'').slice(0,20),name:(r.players.get(socket.id)||{}).name||'ผู้ชม'};emit(r)});
 socket.on('nextRound',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='results'){r.phase='lobby';emit(r)}});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.room);if(!r)return;r.players.delete(socket.id);const humans=[...r.players.values()].filter(p=>!p.bot);if(!humans.length){clearTimer(r);rooms.delete(r.code);return}if(r.hostId===socket.id)r.hostId=humans[0].id;emit(r)})
});
app.get('/health',(req,res)=>res.status(200).send('ok'));
server.listen(process.env.PORT||3000,()=>console.log('POINT STORY CHAOS running'));
