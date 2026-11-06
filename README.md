# POINT! What-Why-How Communication Battle

เกมออนไลน์หลายผู้เล่น 2-12 คน สำหรับฝึกพูด What → Why → How

## Deploy บน Render
1. แตก ZIP แล้วอัปโหลดไฟล์ทั้งหมดไปที่ Root ของ GitHub repository
2. Render > New > Web Service > เชื่อม GitHub repository
3. Runtime: Node
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Deploy แล้วส่ง URL ให้ผู้เล่น

## วิธีเล่น
- Host สร้างห้องและแชร์ Room Code
- ผู้เล่นเข้าห้องด้วยชื่อเล่นและรหัสห้อง
- ทุกคนเตรียมคำตอบ 30 วินาที
- พูดคนละ 60 วินาที ตาม What → Why → How
- คนอื่นให้คะแนน 4 ด้าน

หมายเหตุ: สถานะห้องอยู่ในหน่วยความจำของ server และจะหายเมื่อ Render restart เหมาะกับกิจกรรมสด ไม่ใช่การเก็บผลระยะยาว
