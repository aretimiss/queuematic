
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';

interface NotificationSystemProps {
  queueNumber: number;
  position: number | null;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ queueNumber, position }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showingNotification, setShowingNotification] = useState(false);
  
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
  
  // Show notification when position is 5 or less
  useEffect(() => {
    if (position !== null && position <= 5 && !showingNotification) {
      setShowingNotification(true);
      
      // Browser notification
      if (notificationsEnabled && Notification.permission === 'granted') {
        new Notification('เตรียมตัวได้เลย!', {
          body: `คิวของคุณอีก ${position} คิว จะถึงคิวคุณแล้ว`,
          icon: '/favicon.jpg'
        });
      }
      
      // Play sound
      playNotificationSound();
      
      // Hide the notification after 10 seconds
      setTimeout(() => {
        setShowingNotification(false);
      }, 10000);
    }
  }, [position, notificationsEnabled]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <AnimatePresence>
        {showingNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            className="bg-primary text-white p-4 rounded-lg shadow-elevation max-w-xs"
          >
            <h4 className="font-medium mb-1">ใกล้ถึงคิวของคุณแล้ว!</h4>
            <p className="text-sm">คิวของคุณอีกเพียง {position} คิว กรุณาเตรียมตัวให้พร้อม</p>
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
