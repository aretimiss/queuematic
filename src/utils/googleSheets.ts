
export interface QueueRecord {
  id: string;
  idCardNumber: string;
  timestamp: string;
  queueNumber: number;
  status: 'waiting' | 'processing' | 'completed' | 'cancelled' | 'transferred';
  notificationSent: boolean;
  department?: string; // เพิ่มแผนกที่ผู้ป่วยจะต้องไป
  nextDepartment?: string; // แผนกถัดไปที่ต้องไป (ถ้ามี)
}

export interface QueueStatus {
  currentQueueNumber: number;
  yourQueueNumber: number;
  estimatedTimeMinutes: number;
  position: number;
  waitingCount: number; // จำนวนคิวที่รอ
  processingCount: number; // จำนวนคิวที่กำลังให้บริการ
  department?: string; // แผนกปัจจุบัน
  nextDepartment?: string; // แผนกต่อไป
}

const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxL0We0OByDo2GQB-zxHGTbR6XlViqQSj87kYmZRBBzyPbm9Q9XMLo71Pk8BR2-RnY_/exec';

export const googleSheetsService = {
  async registerQueue(idCardNumber: string): Promise<QueueRecord> {
    try {
      const response = await fetch(`${SHEET_ENDPOINT}?action=registerQueue&idCardNumber=${idCardNumber}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('บันทึกคิวไม่สำเร็จ:', error);
      throw new Error('การลงทะเบียนไม่สำเร็จ');
    }
  },

  async getQueueStatus(queueNumber: number): Promise<QueueStatus> {
    try {
      // เพิ่ม console.log เพื่อตรวจสอบการเรียก API
      console.log(`Fetching queue status for queue number: ${queueNumber}`);
      const response = await fetch(`${SHEET_ENDPOINT}?action=getQueueStatus&queueNumber=${queueNumber}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // เพิ่ม console.log เพื่อตรวจสอบข้อมูลที่ได้รับกลับมา
      console.log('Queue status data received:', data);
      
      return data;
    } catch (error) {
      console.error('ดึงข้อมูลคิวไม่สำเร็จ:', error);
      throw new Error('ไม่สามารถดึงข้อมูลคิวได้');
    }
  },
  
  async checkNotification(queueNumber: number): Promise<boolean> {
    try {
      const response = await fetch(`${SHEET_ENDPOINT}?action=checkNotification&queueNumber=${queueNumber}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('ตรวจสอบการแจ้งเตือนไม่สำเร็จ:', data.error);
        return false;
      }
      
      return data.shouldNotify || false;
    } catch (error) {
      console.error('ไม่สามารถตรวจสอบการแจ้งเตือนได้:', error);
      return false;
    }
  },
  
  async updateQueueStatus(queueNumber: number, status: QueueRecord['status'], nextDepartment?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        action: 'updateQueueStatus',
        queueNumber: queueNumber.toString(),
        status: status
      });
      
      if (nextDepartment) {
        params.append('nextDepartment', nextDepartment);
      }
      
      const response = await fetch(`${SHEET_ENDPOINT}?${params}`);
      const result = await response.json();
      
      if (result.error) {
        console.error('อัพเดทสถานะคิวไม่สำเร็จ:', result.error);
        return false;
      }
      
      return result.success || false;
    } catch (error) {
      console.error('ไม่สามารถอัพเดทสถานะคิวได้:', error);
      return false;
    }
  },
  
  async getQueueByIdCard(idCardNumber: string): Promise<QueueRecord | null> {
    try {
      const response = await fetch(`${SHEET_ENDPOINT}?action=getQueueByIdCard&idCardNumber=${idCardNumber}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('ค้นหาคิวด้วยเลขบัตรประชาชนไม่สำเร็จ:', data.error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('ไม่สามารถค้นหาคิวด้วยเลขบัตรประชาชนได้:', error);
      return null;
    }
  }
};
