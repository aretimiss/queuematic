
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Volume2, VolumeX, Building2 } from 'lucide-react';
import { googleSheetsService, QueueStatus } from '@/utils/googleSheets';

interface NotificationSystemProps {
  queueNumber: number;
  position: number | null;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ queueNumber, position }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showingNotification, setShowingNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'position' | 'department'>('position');
  
  // Request and enable browser notifications
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        // Send a test notification
        new Notification('การแจ้งเตือนทำงานแล้ว', {
          body: 'คุณจะได้รับการแจ้งเตือนเมื่อใกล้ถึงคิวของคุณ',
          icon: '/favicon.jpg'
        });
      }
    }
  };
  
  // Toggle sound notifications
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    localStorage.setItem('notificationSound', (!soundEnabled).toString());
  };
  
  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Check for queue status and notifications
  const checkQueueStatus = async () => {
    if (!notificationsEnabled || !queueNumber) return;
    
    try {
      // Check if there's a notification from the server
      const shouldNotify = await googleSheetsService.checkNotification(queueNumber);
      
      if (shouldNotify) {
        // Get queue status for details
        const status = await googleSheetsService.getQueueStatus(queueNumber);
        
        // Department change notification
        if (status.nextDepartment) {
          showNotification(
            `กรุณาไปที่แผนก ${status.nextDepartment} ต่อไป`,
            'department'
          );
        } 
        // Position notification
        else if (status.position && status.position <= 5) {
          showNotification(
            `คิวของคุณอีก ${status.position} คิว จะถึงคิวคุณแล้ว`,
            'position'
          );
        }
      }
    } catch (error) {
      console.error('Error checking queue status:', error);
    }
  };
  
  // Show notification
  const showNotification = (message: string, type: 'position' | 'department') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowingNotification(true);
    
    // Show browser notification if permitted
    if (notificationsEnabled && Notification.permission === 'granted') {
      const title = type === 'position' ? 'เตรียมตัวได้เลย!' : 'มีการเปลี่ยนแปลงแผนก';
      new Notification(title, {
        body: message,
        icon: '/favicon.jpg'
      });
    }
    
    // Play sound
    playNotificationSound();
    
    // Hide the notification after 10 seconds
    setTimeout(() => {
      setShowingNotification(false);
    }, 10000);
  };
  
  // Load sound preference
  useEffect(() => {
    const soundPref = localStorage.getItem('notificationSound');
    if (soundPref !== null) {
      setSoundEnabled(soundPref === 'true');
    }
    
    // Check if notifications were previously enabled
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);
  
  // Position notification
  useEffect(() => {
    if (position !== null && position <= 5 && notificationsEnabled && !showingNotification) {
      showNotification(`คิวของคุณอีก ${position} คิว จะถึงคิวคุณแล้ว`, 'position');
    }
  }, [position, notificationsEnabled]);
  
  // Set up periodic checks
  useEffect(() => {
    if (notificationsEnabled && queueNumber) {
      // Initial check
      checkQueueStatus();
      
      const checkInterval = setInterval(checkQueueStatus, 15000);
      return () => clearInterval(checkInterval);
    }
  }, [notificationsEnabled, queueNumber]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <AnimatePresence>
        {showingNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            className={`p-4 rounded-lg shadow-elevation max-w-xs text-white ${
              notificationType === 'department' ? 'bg-green-600' : 'bg-primary'
            }`}
          >
            <h4 className="font-medium mb-1">
              {notificationType === 'position' ? 'ใกล้ถึงคิวของคุณแล้ว!' : 'มีการเปลี่ยนแปลงแผนก'}
            </h4>
            <div className="flex items-start gap-2">
              {notificationType === 'department' && <Building2 className="h-5 w-5 mt-0.5" />}
              <p className="text-sm">{notificationMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex space-x-2">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button 
            variant={soundEnabled ? "default" : "outline"}
            size="icon"
            onClick={toggleSound}
            className="h-10 w-10 rounded-full shadow-subtle bg-white"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button 
            variant={notificationsEnabled ? "default" : "outline"}
            size="icon"
            onClick={enableNotifications}
            className="h-10 w-10 rounded-full shadow-subtle bg-white"
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
