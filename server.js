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
 const styles=[
  {w:`วันนี้เกิดเรื่องที่ต้องจัดการทันที เมื่อ ${a} เข้ามาเกี่ยวข้องกับ ${b} และ ${c} ในช่วง ${d}`,y:`เรื่องนี้สำคัญ เพราะถ้าเราไม่จัดการให้ชัด คนในทีมจะเข้าใจไม่ตรงกัน งานจะช้า และอาจตัดสินใจผิดจากข้อมูลที่ไม่ครบ`,h:`ดังนั้น เราควรกำหนดเจ้าของเรื่องหนึ่งคน ตรวจสอบข้อเท็จจริงที่เกี่ยวกับ ${b} และ ${c} แล้วสรุปสิ่งที่ต้องทำต่อให้ทุกคนเข้าใจตรงกันภายในวันนี้`},
  {w:`ประเด็นหลักคือ ${a} ทำให้สถานการณ์ของ ${b} เปลี่ยนไป และตอนนี้ ${c} กลายเป็นสิ่งที่ต้องรีบตรวจสอบก่อน ${d}`,y:`สิ่งที่ต้องระวังคือผลกระทบไม่ได้อยู่แค่เรื่องเดียว หากปล่อยไว้ ทีมอาจเสียเวลาแก้ปัญหาซ้ำ และผู้เกี่ยวข้องอาจได้รับข้อมูลคนละชุด`,h:`ทางออกคือหยุดงานที่ไม่จำเป็นชั่วคราว ตรวจสอบสาเหตุหลักให้ชัด แล้วให้ ${a} กับผู้รับผิดชอบ ${b} ตกลงแผนเดียวกันก่อนเดินหน้าต่อ`},
  {w:`ตอนนี้เรามีสถานการณ์ที่ ${a}, ${b}, ${c} และ ${d} มาเกี่ยวข้องกันในเรื่องเดียว`,y:`เหตุผลที่ควรรีบจัดการ คือเรายังไม่รู้ว่าจุดไหนเป็นสาเหตุจริง หากรีบแก้จากการคาดเดา ปัญหาอาจกลับมาอีก`,h:`ขั้นแรกให้ยืนยันข้อเท็จจริง ขั้นที่สองเลือกปัญหาที่กระทบมากที่สุด และขั้นสุดท้ายกำหนดคนรับผิดชอบกับเวลาที่ชัดเจน จากนั้นค่อยติดตามผล`},
  {w:`สิ่งที่เกิดขึ้นคือ ${b} มีปัญหาในจังหวะที่ ${a} ต้องใช้ ${c} และมีเงื่อนไขเรื่อง ${d} เข้ามาเพิ่ม`,y:`เรื่องนี้สำคัญ เพราะทั้งเวลา คุณภาพงาน และความเข้าใจของทีมได้รับผลพร้อมกัน ถ้าอธิบายไม่ชัด ทุกคนจะพยายามแก้คนละทิศ`,h:`เราควรสรุปปัญหาเป็นประโยคเดียว เลือกทางแก้ที่ทำได้ทันที แล้วนัดตรวจผลสั้นๆ หลังดำเนินการ เพื่อให้มั่นใจว่าปัญหาจบจริง`}
 ];
 const v=styles[Math.floor(Math.random()*styles.length)];
 return {what:v.w,why:v.y,how:v.h,full:`${v.w} ${v.y} ${v.h}`};
}
function publicState(r){return {code:r.code,hostId:r.hostId,players:[...r.players.values()],phase:r.phase,round:r.round,keywords:r.keywords,speakerId:r.speakerId,end:r.end,usedKeywords:r.usedKeywords,botStory:r.botStory,votes:r.votes?Array.from(r.votes.values()):[],lastReaction:r.lastReaction,reactionSeq:r.reactionSeq}}
function emit(r){io.to(r.code).emit('state',publicState(r))}
function clearTimer(r){if(r.timer)clearTimeout(r.timer)}
function nextSpeaker(r){
 r.index++;
 if(r.index>=r.order.length){r.phase='results';r.speakerId=null;r.end=0;r.botStory=null;emit(r);return}
 r.speakerId=r.order[r.index];r.usedKeywords=[];r.botStory=null;r.votes=new Map();
 const p=r.players.get(r.speakerId);
 if(p.bot){r.phase='botSpeak';r.botStory=botStory(r.keywords);r.usedKeywords=[...r.keywords];r.end=Date.now()+30000;emit(r);clearTimer(r);r.timer=setTimeout(()=>startVote(r),30000)}
 else {r.phase='think';r.end=Date.now()+30000;emit(r);clearTimer(r);r.timer=setTimeout(()=>startSpeak(r),30000)}
}
function startSpeak(r){r.phase='speak';r.end=Date.now()+60000;emit(r);clearTimer(r);r.timer=setTimeout(()=>startVote(r),60000)}
function finishScore(r){const p=r.players.get(r.speakerId);if(!p)return;const coverage=(r.usedKeywords.length/r.keywords.length)*10;const vals=[...r.votes.values()];const peer=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;p.lastSystem=Math.round(coverage*10)/10;p.lastPeer=Math.round(peer*10)/10;p.lastTotal=Math.round(((coverage*.5)+(peer*.5))*10)/10;p.score=Math.round((p.score+p.lastTotal)*10)/10}
function startVote(r){r.phase='vote';r.end=Date.now()+12000;emit(r);clearTimer(r);r.timer=setTimeout(()=>{finishScore(r);nextSpeaker(r)},12000)}
function addBot(r){if(r.players.size>=12)return;const id='bot-'+crypto.randomBytes(4).toString('hex');r.players.set(id,{id,name:BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)],score:0,bot:true,lastSystem:0,lastPeer:0,lastTotal:0})}
io.on('connection',socket=>{
 socket.on('createRoom',({name,withBot},cb)=>{try{let code=roomCode();while(rooms.has(code))code=roomCode();const r={code,hostId:socket.id,players:new Map(),phase:'lobby',round:0,keywords:[],speakerId:null,end:0,usedKeywords:[],botStory:null,lastReaction:null,reactionSeq:0,index:-1,order:[],timer:null};r.players.set(socket.id,{id:socket.id,name:(name||'นักเล่าเรื่อง').slice(0,24),score:0,bot:false,lastSystem:0,lastPeer:0,lastTotal:0,lastSystem:0,lastPeer:0,lastTotal:0});if(withBot)addBot(r);rooms.set(code,r);socket.join(code);socket.data.room=code;cb({ok:true,code});emit(r)}catch(e){cb({ok:false,message:'สร้างห้องไม่สำเร็จ'})}});
 socket.on('joinRoom',({name,code},cb)=>{const r=rooms.get(String(code||'').trim().toUpperCase());if(!r)return cb({ok:false,message:'ไม่พบรหัสห้อง'});if(r.phase!=='lobby')return cb({ok:false,message:'เกมเริ่มแล้ว'});if(r.players.size>=12)return cb({ok:false,message:'ห้องเต็ม'});r.players.set(socket.id,{id:socket.id,name:(name||'นักเล่าเรื่อง').slice(0,24),score:0,bot:false,lastSystem:0,lastPeer:0,lastTotal:0});socket.join(r.code);socket.data.room=r.code;cb({ok:true,code:r.code});emit(r)});
 socket.on('addBot',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='lobby'){addBot(r);emit(r)}});
 socket.on('startGame',()=>{const r=rooms.get(socket.data.room);if(!r||r.hostId!==socket.id||r.players.size<2)return;r.round++;r.keywords=keywordSets[Math.floor(Math.random()*keywordSets.length)];r.order=[...r.players.keys()].sort(()=>Math.random()-.5);r.index=-1;r.phase='read';r.end=Date.now()+45000;r.usedKeywords=[];r.botStory=null;emit(r);clearTimer(r);r.timer=setTimeout(()=>nextSpeaker(r),45000)});
 socket.on('readReady',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='read')nextSpeaker(r)});
 socket.on('speakerReady',()=>{const r=rooms.get(socket.data.room);if(r&&r.phase==='think'&&r.speakerId===socket.id)startSpeak(r)});
 socket.on('finishSpeak',()=>{const r=rooms.get(socket.data.room);if(r&&['speak','botSpeak'].includes(r.phase)&&(r.speakerId===socket.id||r.hostId===socket.id))startVote(r)});
 socket.on('rate',({rating})=>{const r=rooms.get(socket.data.room);const v=Math.max(1,Math.min(10,Number(rating)||0));if(r&&r.phase==='vote'&&socket.id!==r.speakerId&&v)r.votes.set(socket.id,v)});
 socket.on('coverage',({used})=>{const r=rooms.get(socket.data.room);if(r&&r.phase==='speak'&&r.speakerId===socket.id){r.usedKeywords=Array.isArray(used)?used.filter(k=>r.keywords.includes(k)):[];emit(r)}});
 socket.on('reaction',({kind})=>{const r=rooms.get(socket.data.room);if(!r||!['speak','botSpeak'].includes(r.phase)||r.speakerId===socket.id)return;r.reactionSeq++;r.lastReaction={seq:r.reactionSeq,kind:String(kind||'').slice(0,20),name:(r.players.get(socket.id)||{}).name||'ผู้ชม'};emit(r)});
 socket.on('nextRound',()=>{const r=rooms.get(socket.data.room);if(r&&r.hostId===socket.id&&r.phase==='results'){r.phase='lobby';emit(r)}});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.room);if(!r)return;r.players.delete(socket.id);const humans=[...r.players.values()].filter(p=>!p.bot);if(!humans.length){clearTimer(r);rooms.delete(r.code);return}if(r.hostId===socket.id)r.hostId=humans[0].id;emit(r)})
});
app.get('/health',(req,res)=>res.status(200).send('ok'));
server.listen(process.env.PORT||3000,()=>console.log('POINT STORY CHAOS running'));
