
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
      // Create a JSON string with the data
      const jsonString = JSON.stringify(data);
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(jsonString, {
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
