# POINT! STORY CHAOS V3 Fixed

## แก้ไข
- สร้างห้องและเข้าห้องด้วย event names ที่ตรงกันระหว่าง Client/Server
- มีข้อความแจ้งเมื่อ Socket.IO เชื่อมต่อ Render ไม่สำเร็จ
- เพิ่ม `/health` สำหรับ Render health check

## Bot
- เพิ่ม Bot จาก Lobby หรือกด “เล่นกับ Bot” ที่หน้าแรก
- Bot สร้างเรื่องตลกจาก Keyword ตาม WHAT → WHY → HOW
- อ่านออกเสียงด้วย Browser SpeechSynthesis (`th-TH`)

## อื่นๆ
- Live Emoji และ Soundboard
- ตรวจ Keyword ของมนุษย์ด้วย Web Speech Recognition
- ไม่มี Background Music

## Render
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`
- ใช้ Node 18 ขึ้นไป
