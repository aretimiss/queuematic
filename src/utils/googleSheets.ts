
/**
 * ยูทิลิตี้สำหรับการโต้ตอบกับ Google Sheets API
 * 
 * การใช้งานนี้ใช้ Google Apps Script ที่เผยแพร่แบบสาธารณะ
 * ซึ่งทำหน้าที่เป็นตัวกลางในการอ่านและเขียนข้อมูลไปยัง Google Sheet
 */

export interface QueueRecord {
  id: string;
  idCardNumber: string;
  timestamp: string;
  queueNumber: number;
  status: 'waiting' | 'processing' | 'completed' | 'cancelled';
  notificationSent: boolean;
}

export interface QueueStatus {
  currentQueueNumber: number;
  yourQueueNumber: number;
  estimatedTimeMinutes: number;
  position: number;
}

// ใช้ลิงก์ Google Sheet ที่ให้มา
// https://docs.google.com/spreadsheets/d/1NitvjEblAeNQnzvHmJrmlLx6wvB29YGC1x6wGG2MW-k/edit
const SHEET_ID = '1NitvjEblAeNQnzvHmJrmlLx6wvB29YGC1x6wGG2MW-k';

// หมายเหตุ: ในสภาพแวดล้อมการผลิตจริง คุณจะต้องสร้าง Google Apps Script
// เว็บแอปที่ทำหน้าที่เป็นตัวกลางเพื่อเข้าถึงชีทนี้และนำไปใช้งาน
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/YOUR_GOOGLE_APPS_SCRIPT_ID/exec';

export const googleSheetsService = {
  /**
   * ลงทะเบียนหมายเลขคิวใหม่สำหรับผู้ป่วย
   */
  async registerQueue(idCardNumber: string): Promise<QueueRecord> {
    try {
      console.log('กำลังลงทะเบียนคิวสำหรับบัตรประชาชนเลขที่:', idCardNumber);
      console.log('ใช้ Google Sheet ID:', SHEET_ID);
      
      // ในการใช้งานจริง จะเป็นการเรียกใช้ Google Apps Script web app
      // สำหรับตัวอย่างนี้ เราจะจำลองการตอบสนอง
      const simulatedResponse: QueueRecord = {
        id: Math.random().toString(36).substring(2, 11),
        idCardNumber,
        timestamp: new Date().toISOString(),
        queueNumber: Math.floor(Math.random() * 100) + 1, // สร้างเลขคิวสุ่มสำหรับตัวอย่าง
        status: 'waiting',
        notificationSent: false
      };
      
      // จำลองการหน่วงเวลาของเครือข่าย
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return simulatedResponse;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลงทะเบียนคิว:', error);
      throw new Error('ไม่สามารถลงทะเบียนคิวได้ กรุณาลองใหม่อีกครั้ง');
    }
  },
  
  /**
   * ดึงสถานะคิวปัจจุบัน
   */
  async getQueueStatus(queueNumber: number): Promise<QueueStatus> {
    try {
      console.log('กำลังดึงสถานะคิวหมายเลข:', queueNumber);
      console.log('ใช้ Google Sheet ID:', SHEET_ID);
      
      // จำลองการหน่วงเวลาของเครือข่าย
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // สำหรับตัวอย่างนี้ เราจะจำลองการตอบสนอง
      const currentQueueNumber = Math.max(1, queueNumber - Math.floor(Math.random() * 10));
      const position = queueNumber - currentQueueNumber;
      
      return {
        currentQueueNumber,
        yourQueueNumber: queueNumber,
        position,
        estimatedTimeMinutes: position * 5 // สมมติว่าใช้เวลา 5 นาทีต่อคิว
      };
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงสถานะคิว:', error);
      throw new Error('ไม่สามารถดึงสถานะคิวได้ กรุณาลองใหม่อีกครั้ง');
    }
  },

  /**
   * ตรวจสอบว่าควรส่งการแจ้งเตือนหรือไม่
   * ส่งคืนค่า true ถ้าคิวห่างไม่เกิน 5 ตำแหน่ง
   */
  async checkNotification(queueNumber: number): Promise<boolean> {
    try {
      const status = await this.getQueueStatus(queueNumber);
      return status.position <= 5;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบการแจ้งเตือน:', error);
      return false;
    }
  },
  
  /**
   * รับ URL ของ Google Sheet สำหรับการดีบั๊กหรือการเข้าถึงด้วยตนเอง
   */
  getSheetUrl(): string {
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
  }
};
