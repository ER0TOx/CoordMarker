# Offline Breadcrumb GPS Tracker

แอปพลิเคชันมือถือสำหรับนำทางและระบุพิกัดสัมพัทธ์แบบออฟไลน์ (Offline Local Coordinate Tracker) พัฒนาด้วย **React Native (Expo)** ออกแบบมาสำหรับการเดินป่าหรือพื้นที่ไร้สัญญาณอินเทอร์เน็ต โดยอาศัยชิปฮาร์ดแวร์ GPS โดยตรงเพื่อแปลงพิกัดภูมิศาสตร์เป็นพิกัดคาร์ทีเซียน $(x, y)$ เทียบกับจุดเริ่มต้นที่มาร์กไว้

---

## ฟังก์ชันการทำงานหลัก

- **Offline 100%:** ไม่จำเป็นต้องต่ออินเทอร์เน็ตหรือโหลดแผนที่ภาพ ใช้เพียงสัญญาณจากชิปดาวเทียม GPS
- **Mark Origin $(0, 0)$:** กำหนดจุดอ้างอิงเริ่มต้นได้ด้วยการแตะเพียงครั้งเดียว
- **Relative Coordinates $(x, y)$:** คำนวณระยะขจัดในแนวแกนราบ (หน่วยเมตร):
  - $X$: ระยะทางแนวแกน ตะวันออก (+) / ตะวันตก (-)
  - $Y$: ระยะทางแนวแกน เหนือ (+) / ใต้ (-)
- **Distance to Origin:** คำนวณระยะห่างทางตรงจากตำแหน่งปัจจุบันกลับไปยังจุด Origin
- **Velocity Tracking $(v_x, v_y)$:** คำนวณเวกเตอร์ความเร็วตามแนวแกนจากอัตราการเปลี่ยนแปลงตำแหน่งจริง ($\Delta x / \Delta t$) พร้อมระบบตัดสัญญาณรบกวน (Noise Filter)
- **Signal Quality Indicator:** แสดงค่า GPS Accuracy เพื่อบอกระดับความคลาดเคลื่อนของสัญญาณดาวเทียมแบบเรียลไทม์

---

## หลักการคำนวณทางคณิตศาสตร์

ระบบแปลงพิกัดละติจูดและลองจิจูด $(\text{lat}, \text{lon})$ เป็นพิกัดระนาบแบน $(x, y)$ โดยใช้โมเดลทรงกลมของโลก (รัศมีเฉลี่ย $R = 6,371,000\text{ m}$):

$$\Delta \text{lat} = (\text{lat} - \text{lat}_0) \times \frac{\pi}{180}, \quad \Delta \text{lon} = (\text{lon} - \text{lon}_0) \times \frac{\pi}{180}$$

$$x = \Delta \text{lon} \times \cos\left(\frac{\text{lat}_0 + \text{lat}}{2} \times \frac{\pi}{180}\right) \times R$$

$$y = \Delta \text{lat} \times R$$

$$d = \sqrt{x^2 + y^2}$$

---

## เทคโนโลยีที่ใช้

- **Framework:** React Native / Expo (Expo Router)
- **Language:** TypeScript
- **Sensors API:** `expo-location`

---

## ขั้นตอนการติดตั้งและรันเพื่อทดสอบ

### 1. ติดตั้ง Dependencies

```bash
npm install
npx expo install expo-location
```
