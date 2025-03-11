
/**
 * Utility for interacting with Google Sheets API
 * 
 * This implementation uses a public Google Apps Script deployment
 * that acts as a proxy to read and write data to a Google Sheet
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

// Using the provided Google Sheet link
// https://docs.google.com/spreadsheets/d/1NitvjEblAeNQnzvHmJrmlLx6wvB29YGC1x6wGG2MW-k/edit
const SHEET_ID = '1NitvjEblAeNQnzvHmJrmlLx6wvB29YGC1x6wGG2MW-k';

// Note: In a production environment, you would need to create a Google Apps Script
// web app that serves as a proxy to access this sheet and deploy it
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/YOUR_GOOGLE_APPS_SCRIPT_ID/exec';

export const googleSheetsService = {
  /**
   * Registers a new queue number for a patient
   */
  async registerQueue(idCardNumber: string): Promise<QueueRecord> {
    try {
      console.log('Registering queue for ID card:', idCardNumber);
      console.log('Using Google Sheet ID:', SHEET_ID);
      
      // In a real implementation, this would call the Google Apps Script web app
      // For demo purposes, we'll simulate a response
      const simulatedResponse: QueueRecord = {
        id: Math.random().toString(36).substring(2, 11),
        idCardNumber,
        timestamp: new Date().toISOString(),
        queueNumber: Math.floor(Math.random() * 100) + 1, // random queue number for demo
        status: 'waiting',
        notificationSent: false
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return simulatedResponse;
    } catch (error) {
      console.error('Error registering queue:', error);
      throw new Error('Failed to register queue. Please try again later.');
    }
  },
  
  /**
   * Gets the current queue status
   */
  async getQueueStatus(queueNumber: number): Promise<QueueStatus> {
    try {
      console.log('Getting queue status for number:', queueNumber);
      console.log('Using Google Sheet ID:', SHEET_ID);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // For demo purposes, we'll simulate a response
      const currentQueueNumber = Math.max(1, queueNumber - Math.floor(Math.random() * 10));
      const position = queueNumber - currentQueueNumber;
      
      return {
        currentQueueNumber,
        yourQueueNumber: queueNumber,
        position,
        estimatedTimeMinutes: position * 5 // Assuming 5 minutes per queue
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw new Error('Failed to get queue status. Please try again later.');
    }
  },

  /**
   * Checks if a notification should be sent
   * Returns true if the queue is 5 or fewer positions away
   */
  async checkNotification(queueNumber: number): Promise<boolean> {
    try {
      const status = await this.getQueueStatus(queueNumber);
      return status.position <= 5;
    } catch (error) {
      console.error('Error checking notification:', error);
      return false;
    }
  },
  
  /**
   * Gets the Google Sheet URL for debugging or manual access
   */
  getSheetUrl(): string {
    return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
  }
};
