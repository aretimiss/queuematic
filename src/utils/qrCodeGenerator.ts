
/**
 * ยูทิลิตี้สำหรับสร้าง QR Code
 */

import QRCode from 'qrcode';

export interface QRCodeData {
  idCardNumber: string;
  queueNumber: number;
  timestamp: string;
}

export const qrCodeGenerator = {
  /**
   * สร้าง QR Code จากข้อมูลคิว
   */
  async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      // จัดรูปแบบข้อมูลเป็นสตริงที่มีเลขบัตรประชาชนและหมายเลขคิวเท่านั้น
      // เปลี่ยนให้มีเฉพาะเลขบัตรประชาชนและหมายเลขคิวตามที่ร้องขอ
      const qrContent = `${data.idCardNumber},${data.queueNumber}`;
      
      // สร้าง QR Code เป็น data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสร้าง QR Code:', error);
      throw new Error('ไม่สามารถสร้าง QR Code ได้');
    }
  }
};
