
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueueRecord } from '@/utils/googleSheets';
import { Loader2, Download, RefreshCw, CreditCard, Hash, Share2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface QRCodeDisplayProps {
  queueData: QueueRecord;
  onBack: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ queueData, onBack }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleDownload = () => {
    // สร้างข้อความที่ประกอบด้วยหมายเลขคิวและเลขบัตรประชาชน
    const contentToDownload = `หมายเลขคิว: ${queueData.queueNumber}\nเลขบัตรประชาชน: ${queueData.idCardNumber}`;
    
    // สร้าง Blob จากข้อความ
    const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
    
    // สร้าง URL สำหรับ Blob
    const url = URL.createObjectURL(blob);
    
    // สร้างลิงก์สำหรับดาวน์โหลดและคลิกโดยอัตโนมัติ
    const link = document.createElement('a');
    link.href = url;
    link.download = `คิว-${queueData.queueNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // ทำความสะอาดโดยการลบลิงก์และเพิกถอน URL
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: "บันทึกข้อมูลคิวเรียบร้อยแล้ว",
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ข้อมูลคิวโรงพยาบาล',
          text: `หมายเลขคิว: ${queueData.queueNumber}\nเลขบัตรประชาชน: ${queueData.idCardNumber}`,
        });
        toast({
          title: "แชร์สำเร็จ",
          description: "ข้อมูลคิวถูกแชร์เรียบร้อยแล้ว",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: "แชร์ไม่สำเร็จ",
          description: "ไม่สามารถแชร์ข้อมูลคิวได้",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "ไม่รองรับการแชร์",
        description: "อุปกรณ์ของคุณไม่รองรับฟังก์ชันการแชร์",
        variant: "destructive",
      });
    }
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
        key="queue-info-card"
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
            <CardTitle className="text-2xl font-medium pt-2">ข้อมูลคิวสำหรับเจ้าหน้าที่</CardTitle>
            <CardDescription>
              แสดงข้อมูลนี้เมื่อถึงคิวของคุณ
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-subtle">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">หมายเลขคิว:</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{queueData.queueNumber}</span>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">เลขบัตรประชาชน:</span>
                  </div>
                  <span className="text-lg font-medium">{queueData.idCardNumber}</span>
                </div>
                
                <div className="flex flex-col space-y-1.5 pt-2">
                  <p className="text-sm text-muted-foreground">ลงทะเบียนเมื่อ</p>
                  <p className="font-medium">{formatTime(queueData.timestamp)}</p>
                </div>
              </div>
            </div>
            
            {queueData.department && (
              <div className="bg-secondary rounded-lg p-4">
                <h4 className="font-medium text-center mb-2">ข้อมูลการรักษา</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/50 p-2 rounded">
                    <p className="text-muted-foreground">แผนกปัจจุบัน</p>
                    <p className="font-medium">{queueData.department}</p>
                  </div>
                  {queueData.nextDepartment && (
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-muted-foreground">แผนกถัดไป</p>
                      <p className="font-medium">{queueData.nextDepartment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pt-0">
            <Button
              variant="default"
              className="w-full hover-scale"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              บันทึกข้อมูลคิว
            </Button>
            
            {navigator.share && (
              <Button
                variant="outline"
                className="w-full hover-scale"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                แชร์ข้อมูลคิว
              </Button>
            )}
            
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
