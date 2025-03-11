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

const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxL0We0OByDo2GQB-zxHGTbR6XlViqQSj87kYmZRBBzyPbm9Q9XMLo71Pk8BR2-RnY_/exec';

export const googleSheetsService = {
  async registerQueue(idCardNumber: string): Promise<QueueRecord> {
    try {
      const response = await fetch(`${SHEET_ENDPOINT}?action=registerQueue&idCardNumber=${idCardNumber}`);
      return await response.json();
    } catch (error) {
      console.error('Error registering queue:', error);
      throw new Error('Registration failed');
    }
  },

  async getQueueStatus(queueNumber: number): Promise<QueueStatus> {
    try {
      const response = await fetch(`${SHEET_ENDPOINT}?action=getQueueStatus&queueNumber=${queueNumber}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw new Error('Failed to fetch queue status');
    }
  }
};
