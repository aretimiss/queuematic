
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueueRecord } from '@/utils/googleSheets';
import { qrCodeGenerator } from '@/utils/qrCodeGenerator';
import { Loader2, Download, RefreshCw } from 'lucide-react';

interface QRCodeDisplayProps {
  queueData: QueueRecord;
  onBack: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ queueData, onBack }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true);
        const qrData = {
          idCardNumber: queueData.idCardNumber,
          queueNumber: queueData.queueNumber,
          timestamp: queueData.timestamp
        };
        
        const dataUrl = await qrCodeGenerator.generateQRCode(qrData);
        setQrCodeUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generateQRCode();
  }, [queueData]);
  
  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `queue-${queueData.queueNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="qr-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="glass-card overflow-hidden border border-primary/10">
          <CardHeader className="space-y-1 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium"
            >
              คิวหมายเลข {queueData.queueNumber}
            </motion.div>
            <CardTitle className="text-2xl font-medium pt-2">QR Code สำหรับเจ้าหน้าที่</CardTitle>
            <CardDescription>
              แสดง QR Code นี้เมื่อถึงคิวของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-0">
            <div className="w-64 h-64 flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-subtle">
              {loading ? (
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              ) : qrCodeUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-4">
                  <RefreshCw className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">ไม่สามารถสร้าง QR Code ได้</p>
                </div>
              )}
            </div>
          </CardContent>
          
          <div className="px-6 py-4">
            <div className="flex flex-col space-y-1.5 text-center">
              <p className="text-sm text-muted-foreground">ลงทะเบียนเมื่อ</p>
              <p className="font-medium">{formatTime(queueData.timestamp)}</p>
            </div>
          </div>
          
          <CardFooter className="flex flex-col gap-2 pt-0">
            <Button
              variant="outline"
              className="w-full hover-scale"
              onClick={handleDownload}
              disabled={!qrCodeUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              บันทึก QR Code
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onBack}
            >
              กลับไปหน้าหลัก
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
