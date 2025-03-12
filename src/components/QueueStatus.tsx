
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { googleSheetsService, QueueStatus } from '@/utils/googleSheets';
import { Clock, RefreshCw, ArrowLeft, Bell, BellRing, ArrowRight, Users, Building2 } from 'lucide-react';

interface QueueStatusProps {
  queueNumber: number;
  onBack: () => void;
  onRefresh?: () => void;
}

export const QueueStatusDisplay: React.FC<QueueStatusProps> = ({ queueNumber, onBack, onRefresh }) => {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkNotificationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch queue status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await googleSheetsService.getQueueStatus(queueNumber);
      setStatus(data);
      setRefreshTime(new Date());
      
      // Check if we need to show a notification
      if (notificationEnabled && data.position <= 5) {
        showQueueNotification(data.position);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
      setError('ไม่สามารถดึงข้อมูลคิวได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  // Show notification
  const showQueueNotification = (position: number) => {
    if (!('Notification' in window)) return;
    
    setShowNotification(true);
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('เตรียมตัวได้เลย!', {
        body: `คิวของคุณอีก ${position} คิว จะถึงคิวคุณแล้ว`,
        icon: '/favicon.jpg'
      });
    }
    
    // Hide the UI notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };
  
  // Enable notifications
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationEnabled(true);
      }
    }
  };
  
  // Auto-refresh queue status
  useEffect(() => {
    fetchStatus();
    
    // Set up auto-refresh every 30 seconds
    refreshTimeoutRef.current = setInterval(() => {
      fetchStatus();
    }, 30000);
    
    // Set up notification check every 15 seconds
    if (notificationEnabled) {
      checkNotificationRef.current = setInterval(async () => {
        try {
          const shouldNotify = await googleSheetsService.checkNotification(queueNumber);
          if (shouldNotify) {
            const status = await googleSheetsService.getQueueStatus(queueNumber);
            showQueueNotification(status.position);
          }
        } catch (error) {
          console.error('Error checking notification:', error);
        }
      }, 15000);
    }
    
    return () => {
      // Clean up timers
      if (refreshTimeoutRef.current) clearInterval(refreshTimeoutRef.current);
      if (checkNotificationRef.current) clearInterval(checkNotificationRef.current);
    };
  }, [queueNumber, notificationEnabled]);
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!status) return 0;
    const total = status.yourQueueNumber;
    const current = status.currentQueueNumber;
    if (total <= current) return 100;
    
    // Calculate how far along we are
    const progressPercentage = (current / total) * 100;
    return Math.min(Math.max(progressPercentage, 0), 100);
  };
  
  // Format refresh time
  const formatRefreshTime = () => {
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }).format(refreshTime);
  };
  
  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-primary text-white px-4 py-3 rounded-lg shadow-elevation flex items-center space-x-2">
            <BellRing className="h-5 w-5" />
            <span>คิวของคุณอีก {status?.position} คิว จะถึงคิวคุณแล้ว</span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="glass-card overflow-hidden">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
                <CardTitle className="text-xl font-medium">สถานะคิว</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant={notificationEnabled ? "default" : "outline"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={enableNotifications}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={fetchStatus} 
                    disabled={loading}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </motion.div>
              </div>
            </div>
            <CardDescription>
              ข้อมูลอัพเดทล่าสุดเมื่อ {formatRefreshTime()} น.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error ? (
              <div className="text-center py-4">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchStatus} 
                  className="mt-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  ลองใหม่
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">คิวของคุณ</p>
                  <h2 className="text-4xl font-bold">{queueNumber}</h2>
                </div>
                
                {status?.department && (
                  <div className="bg-primary/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">ข้อมูลแผนก</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">แผนกปัจจุบัน:</span>
                        <span className="font-medium">{status.department}</span>
                      </div>
                      
                      {status.nextDepartment && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">แผนกถัดไป:</span>
                          <div className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-1 text-primary" />
                            <span className="font-medium">{status.nextDepartment}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">คิวที่กำลังให้บริการ</span>
                    <span className="text-xl font-medium">{status?.currentQueueNumber || '-'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">จำนวนคิวที่รออยู่</span>
                    </div>
                    <span className="font-medium">{status?.waitingCount || '0'}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={calculateProgress()} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>เริ่มต้น</span>
                      <span>คิวของคุณ ({queueNumber})</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-primary/5 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">อีกประมาณ</p>
                      <p className="text-xs text-muted-foreground">รอคิวอยู่ {status?.position || '-'} คิว</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{status?.estimatedTimeMinutes || '-'}</p>
                    <p className="text-xs text-muted-foreground">นาที</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex-col space-y-2">
            <Button 
              onClick={fetchStatus} 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  กำลังอัพเดทข้อมูล
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  อัพเดทสถานะคิว
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
