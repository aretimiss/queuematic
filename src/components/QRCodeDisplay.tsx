
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueueRecord } from '@/utils/googleSheets';
import { Download, Share2, CreditCard, Hash, MapPin, ArrowRight, Building2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface QRCodeDisplayProps {
  queueData: QueueRecord;
  onBack: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ queueData, onBack }) => {
  const { toast } = useToast();
  
  const handleDownload = () => {
    // สร้างข้อความที่ประกอบด้วยหมายเลขคิวและเลขบัตรประชาชน
    const contentToDownload = `
      ข้อมูลผู้ป่วย - โรงพยาบาล
      =======================
      หมายเลขคิว: ${queueData.queueNumber}
      เลขบัตรประชาชน: ${queueData.idCardNumber}
      วันที่ลงทะเบียน: ${new Date(queueData.timestamp).toLocaleString('th-TH')}
      ${queueData.department ? `แผนกปัจจุบัน: ${queueData.department}` : ''}
      ${queueData.nextDepartment ? `แผนกถัดไป: ${queueData.nextDepartment}` : ''}
      =======================
      กรุณาเก็บข้อมูลนี้ไว้และแสดงพร้อมบัตรประชาชนเมื่อถึงคิวของท่าน
    `;
    
    // สร้าง Blob จากข้อความ
    const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
    
    // สร้าง URL สำหรับ Blob
    const url = URL.createObjectURL(blob);
    
    // สร้างลิงก์สำหรับดาวน์โหลดและคลิกโดยอัตโนมัติ
    const link = document.createElement('a');
    link.href = url;
    link.download = `คิว-${queueData.queueNumber}-${queueData.idCardNumber.substring(queueData.idCardNumber.length - 4)}.txt`;
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
            <CardTitle className="text-2xl font-medium pt-2">รายละเอียดคิว</CardTitle>
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
            
            <div className="bg-secondary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-medium">ข้อมูลแผนกที่ต้องไป</h3>
              </div>
              
              {queueData.department ? (
                <div className="space-y-4">
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">แผนกปัจจุบัน</p>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <p className="font-medium">{queueData.department}</p>
                    </div>
                  </div>
                  
                  {queueData.nextDepartment && (
                    <div className="bg-white/80 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">แผนกถัดไป</p>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                          <p className="font-medium">{queueData.nextDepartment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  <p>ยังไม่ได้ระบุแผนก</p>
                  <p className="text-xs">โปรดรอเจ้าหน้าที่ดำเนินการ</p>
                </div>
              )}
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4">
              <h4 className="font-medium mb-2">คำแนะนำ</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  <span>โปรดแสดงข้อมูลนี้พร้อมบัตรประชาชนเมื่อถึงคิวของท่าน</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  <span>เมื่อมีการเปลี่ยนแผนก เจ้าหน้าที่จะอัปเดตข้อมูลให้ท่านทราบ</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  <span>หากต้องการความช่วยเหลือ สามารถสอบถามเจ้าหน้าที่ได้</span>
                </li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pt-0">
            <Button
              variant="default"
              className="w-full hover-scale"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              บันทึกข้อมูลคิวและเลขบัตร
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
