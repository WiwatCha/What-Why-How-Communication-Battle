# POINT! Ultimate What-Why-How Battle
เกมออนไลน์ 1-12 คน ฝึกพูด WHAT → WHY → HOW พร้อม BOT, Background Music, Sound Effects และ Visual Effects

## Deploy บน Render
1. แตก ZIP และอัปโหลดไฟล์ทั้งหมดไว้ที่ Root ของ GitHub repository
2. Render > New > Web Service แล้วเชื่อม GitHub
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy และแชร์ Public URL

## โหมด
- เล่นคนเดียวกับ BOT: กดปุ่มบนหน้าแรก ระบบสร้างคู่แข่งให้อัตโนมัติ
- Multiplayer: สร้างห้อง แชร์ Room Code และเพิ่ม BOT ได้จาก Lobby
- รองรับผู้เล่นรวม BOT สูงสุด 12 คน

เสียงทั้งหมดสังเคราะห์ด้วย Web Audio API ใน Browser จึงไม่มีไฟล์เพลงภายนอกและไม่มีประเด็นลิขสิทธิ์ ผู้เล่นต้องคลิกสร้างหรือเข้าห้องก่อน Browser จึงอนุญาตให้เล่นเสียง
