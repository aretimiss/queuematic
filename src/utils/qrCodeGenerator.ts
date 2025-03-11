
/**
 * Utility for generating QR codes
 */

import QRCode from 'qrcode';

export interface QRCodeData {
  idCardNumber: string;
  queueNumber: number;
  timestamp: string;
}

export const qrCodeGenerator = {
  /**
   * Generates a QR code data URL from queue information
   */
  async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      // Format the data as a string with ID card number and queue number only
      // Changed to only include ID card number and queue number as requested
      const qrContent = `${data.idCardNumber},${data.queueNumber}`;
      
      // Generate QR code as data URL
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
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
};
