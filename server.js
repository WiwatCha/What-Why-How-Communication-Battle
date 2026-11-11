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
 const patterns=[
  {
   what:`ประเด็นที่อยากแจ้งตอนนี้คือ เรื่อง ${a} กำลังส่งผลต่อ ${b} และเราจำเป็นต้องตัดสินใจว่าจะจัดการอย่างไรต่อ`,
   why:`เรื่องนี้ควรคุยกันตอนนี้ เพราะหากปล่อยไว้อาจกระทบการทำงานที่เกี่ยวข้องกับ ${c} และทำให้ทีมเสียเวลาแก้ไขภายหลังมากขึ้น`,
   how:`เหตุการณ์นี้เกิดขึ้นในช่วง ${d} โดยมี ${a} และ ${b} เป็นประเด็นหลัก ผลกระทบคือทีมอาจทำงานต่อไม่ได้ตามแผน ทางเลือกแรกคือแก้เฉพาะจุดเพื่อให้งานเดินต่อได้เร็ว ทางเลือกที่สองคือหยุดตรวจสาเหตุให้ครบก่อน แล้วเลือกแนวทางที่ลดโอกาสเกิดปัญหาซ้ำ`
  },
  {
   what:`เรื่องสำคัญที่ต้องการให้ทุกคนรับรู้คือ เราพบประเด็นระหว่าง ${a} กับ ${b} ซึ่งต้องมีคนตัดสินใจเรื่องนี้`,
   why:`เหตุผลที่ยกเรื่องนี้ขึ้นมาตอนนี้ เพราะสถานการณ์เริ่มเกี่ยวข้องกับ ${c} หากยังไม่มีข้อสรุป อาจทำให้คนในทีมเข้าใจไม่ตรงกันและกระทบงานถัดไป`,
   how:`สถานการณ์เกิดขึ้นช่วง ${d} จุดที่ต้องตรวจสอบคือความเกี่ยวข้องของ ${a} กับ ${b} และผลต่อ ${c} เรามีสองทางเลือก คือแก้ปัญหาเร่งด่วนก่อนแล้วติดตามผล หรือจัดการสาเหตุหลักทันทีแม้จะใช้เวลามากกว่า ข้อเสนอคือเลือกแนวทางตามระดับผลกระทบและเวลาที่เรามี`
  },
  {
   what:`วันนี้มีหนึ่งประเด็นที่ต้องตัดสินใจ คือเราจะจัดการเรื่อง ${a} ที่เกี่ยวข้องกับ ${b} อย่างไร`,
   why:`จำเป็นต้องตัดสินใจตอนนี้ เพราะเรื่องนี้เริ่มมีผลต่อ ${c} และถ้าช้าออกไป ความเสียหายหรือภาระงานอาจเพิ่มขึ้น`,
   how:`เรื่องเกิดขึ้นในช่วง ${d} และเกี่ยวข้องกับ ${a}, ${b} และ ${c} โดยตรง ผลกระทบหลักคือความล่าช้าและความไม่ชัดเจน ทางเลือกที่เสนอมีสองแบบ แบบแรกใช้มาตรการชั่วคราวเพื่อให้งานเดินต่อ แบบที่สองแก้สาเหตุหลักเพื่อป้องกันการเกิดซ้ำ จากนั้นกำหนดเจ้าของงานและเวลาติดตามผลให้ชัดเจน`
  },
  {
   what:`ข้อสรุปที่ต้องการสื่อคือ เรื่อง ${a} และ ${b} ต้องได้รับการจัดลำดับความสำคัญก่อนงานอื่นที่เกี่ยวข้อง`,
   why:`สาเหตุที่ต้องพูดเรื่องนี้ตอนนี้ เพราะ ${c} เริ่มได้รับผลกระทบ และหากไม่มีทิศทางร่วมกัน ทีมอาจตัดสินใจคนละแบบ`,
   how:`บริบทของเรื่องเกิดขึ้นช่วง ${d} เราควรยืนยันข้อเท็จจริงของ ${a} และ ${b} ก่อน ประเมินผลกระทบต่อ ${c} แล้วพิจารณาสองทางเลือก คือดำเนินการทันทีด้วยวิธีที่เร็วที่สุด หรือใช้เวลาเพิ่มเพื่อตรวจสาเหตุและวางแนวทางถาวร ก่อนเลือกทางที่เหมาะกับความเร่งด่วน`
  }
 ];
 const v=patterns[Math.floor(Math.random()*patterns.length)];
 return {what:v.what,why:v.why,how:v.how,full:`${v.what} ${v.why} ${v.how}`};
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
