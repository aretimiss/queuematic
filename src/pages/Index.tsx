
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueForm } from '@/components/QueueForm';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { QueueStatusDisplay } from '@/components/QueueStatus';
import { NotificationSystem } from '@/components/NotificationSystem';
import { QueueRecord, googleSheetsService } from '@/utils/googleSheets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Hospital, Clock, QrCode } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'qrcode' | 'status'>('form');
  const [queueData, setQueueData] = useState<QueueRecord | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Check localStorage for saved queue data on initial load
  useEffect(() => {
    const savedQueueData = localStorage.getItem('queueData');
    if (savedQueueData) {
      try {
        const parsedData = JSON.parse(savedQueueData) as QueueRecord;
        console.log("Loaded queue data from localStorage:", parsedData); // ตรวจสอบข้อมูลที่โหลดมา
        setQueueData(parsedData);
        
        // If we have queue data, show the status by default
        setCurrentStep('status');
        
        // Start checking queue position
        checkQueuePosition(parsedData.queueNumber);
      } catch (error) {
        console.error('Error parsing saved queue data:', error);
        // If there's an error parsing the data, remove it
        localStorage.removeItem('queueData');
      }
    }
  }, []);
  
  // Check the queue position periodically
  const checkQueuePosition = async (queueNumber: number) => {
    try {
      const status = await googleSheetsService.getQueueStatus(queueNumber);
      setQueuePosition(status.position);
      
      // อัพเดทข้อมูลแผนกใน queueData ถ้าพบข้อมูลใหม่
      if (status.department || status.nextDepartment) {
        setQueueData(prevData => {
          if (!prevData) return null;
          
          const updatedData = {
            ...prevData,
            department: status.department || prevData.department,
            nextDepartment: status.nextDepartment || prevData.nextDepartment
          };
          
          // บันทึกข้อมูลที่อัพเดทลง localStorage
          localStorage.setItem('queueData', JSON.stringify(updatedData));
          
          return updatedData;
        });
      }
    } catch (error) {
      console.error('Error checking queue position:', error);
    }
  };
  
  // Handle queue registration
  const handleQueueRegistered = (data: QueueRecord) => {
    setQueueData(data);
    setCurrentStep('qrcode');
    
    // Save the queue data to localStorage
    localStorage.setItem('queueData', JSON.stringify(data));
    
    // Start checking queue position
    checkQueuePosition(data.queueNumber);
  };
  
  // Go back to form
  const handleBackToForm = () => {
    // Ask for confirmation if going back from status to form
    if (currentStep === 'status' && queueData) {
      if (window.confirm('คุณต้องการยกเลิกคิวปัจจุบันและเริ่มใหม่ใช่หรือไม่?')) {
        localStorage.removeItem('queueData');
        setQueueData(null);
        setQueuePosition(null);
        setCurrentStep('form');
      }
    } else {
      setCurrentStep('form');
    }
  };
  
  // Go to QR code display
  const handleShowQRCode = () => {
    setCurrentStep('qrcode');
  };
  
  // Go to status display
  const handleShowStatus = () => {
    setCurrentStep('status');
  };
  
  // Main content based on current step
  const renderMainContent = () => {
    switch (currentStep) {
      case 'form':
        return <QueueForm onQueueRegistered={handleQueueRegistered} />;
      case 'qrcode':
        return queueData ? (
          <QRCodeDisplay queueData={queueData} onBack={handleShowStatus} />
        ) : (
          <div className="text-center p-8">
            <p>ไม่พบข้อมูลคิว กรุณาลงทะเบียนใหม่</p>
          </div>
        );
      case 'status':
        return queueData ? (
          <QueueStatusDisplay 
            queueNumber={queueData.queueNumber} 
            onBack={handleBackToForm} 
            onRefresh={() => checkQueuePosition(queueData.queueNumber)}
          />
        ) : (
          <div className="text-center p-8">
            <p>ไม่พบข้อมูลคิว กรุณาลงทะเบียนใหม่</p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-full h-1/4 bg-gradient-to-t from-blue-50/50 to-transparent" />
      </div>
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 pt-8 pb-6 px-4"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center mb-2">
            <Hospital className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-medium">มินิโปรเจคนักศึกษาระบบจองคิวโรงพยาบาล</h1>
            
          </div>
          <p className="text-center text-muted-foreground max-w-md mx-auto">
            ลงทะเบียนด้วยเลขบัตรประชาชน รับคิวอัตโนมัติ พร้อมการแจ้งเตือนเมื่อใกล้ถึงคิว กรุณาแสดงบัตรประชาชนพร้อมหมายเลขคิว
          </p>
        </div>
      </motion.header>
      
      {/* Main content */}
      <main className="flex-grow relative z-10 px-4 pb-20">
        <div className="container mx-auto max-w-5xl">
          {/* Queue tabs - show only if queue data exists */}
          {queueData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <Tabs 
                defaultValue={currentStep === 'qrcode' ? 'qrcode' : 'status'} 
                className="w-full max-w-md mx-auto"
                onValueChange={(value) => {
                  if (value === 'status') handleShowStatus();
                  if (value === 'qrcode') handleShowQRCode();
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="status" className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2" />
                    สถานะคิว
                  </TabsTrigger>
                  <TabsTrigger value="qrcode" className="flex items-center justify-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="status" className="mt-0 p-0">
                  {/* Status tab content rendered by renderMainContent() */}
                </TabsContent>
                <TabsContent value="qrcode" className="mt-0 p-0">
                  {/* QR code tab content rendered by renderMainContent() */}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
          
          {/* Main step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-10 py-4 px-4 mt-auto"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center text-sm text-muted-foreground">
            <p>©  ผู้จัดทำนักศึกษามหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก</p>
            <p>รายชื่อผู้จัดทำ</p>
            <p>นายกำพน ชื่นชม</p>
            <p>นางสาววณิดา แสงทับทิม </p>
            <p>นางสาวอริษา นิลกิจ</p>
          </div>
        </div>
      </motion.footer>
      
      {/* Notification system */}
      {queueData && (
        <NotificationSystem 
          queueNumber={queueData.queueNumber}
          position={queuePosition}
        />
      )}
    </div>
  );
};

export default Index;
