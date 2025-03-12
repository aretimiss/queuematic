
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { googleSheetsService, QueueRecord } from '@/utils/googleSheets';
import { ArrowRight, ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QueueFormProps {
  onQueueRegistered: (queueData: QueueRecord) => void;
}

export const QueueForm: React.FC<QueueFormProps> = ({ onQueueRegistered }) => {
  const [idCardNumber, setIdCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingQueueData, setExistingQueueData] = useState<QueueRecord | null>(null);
  const { toast } = useToast();
  
  // Validates a Thai ID card number (13 digits)
  const validateIdCardNumber = (id: string): boolean => {
    // Basic validation - 13 digits
    const idPattern = /^\d{13}$/;
    return idPattern.test(id);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    
    // Limit to 13 digits (Thai ID card length)
    if (value.length <= 13) {
      setIdCardNumber(value);
      
      // Reset existing queue data when input changes
      if (existingQueueData) {
        setExistingQueueData(null);
      }
    }
  };
  
  const checkExistingQueue = async () => {
    if (!validateIdCardNumber(idCardNumber)) {
      toast({
        title: "กรุณาตรวจสอบเลขบัตรประชาชน",
        description: "เลขบัตรประชาชนต้องมี 13 หลัก",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setCheckingExisting(true);
      const queueData = await googleSheetsService.getQueueByIdCard(idCardNumber);
      
      if (queueData && ['waiting', 'processing', 'transferred'].includes(queueData.status)) {
        setExistingQueueData(queueData);
      } else {
        setExistingQueueData(null);
        handleSubmit();
      }
    } catch (error) {
      console.error('Error checking existing queue:', error);
      // If there's an error checking, proceed with queue registration
      handleSubmit();
    } finally {
      setCheckingExisting(false);
    }
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateIdCardNumber(idCardNumber)) {
      toast({
        title: "กรุณาตรวจสอบเลขบัตรประชาชน",
        description: "เลขบัตรประชาชนต้องมี 13 หลัก",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const queueData = await googleSheetsService.registerQueue(idCardNumber);
      
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: `คุณได้รับคิวหมายเลข ${queueData.queueNumber}`,
      });
      
      onQueueRegistered(queueData);
    } catch (error) {
      console.error('Error registering queue:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const useExistingQueue = () => {
    if (existingQueueData) {
      onQueueRegistered(existingQueueData);
      
      toast({
        title: "ดึงข้อมูลคิวสำเร็จ",
        description: `คุณมีคิวหมายเลข ${existingQueueData.queueNumber} อยู่แล้วในระบบ`,
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-medium">ลงทะเบียนรับคิว</CardTitle>
          <CardDescription>
            กรุณากรอกเลขบัตรประชาชน 13 หลักเพื่อรับคิว
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingQueueData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">พบคิวในระบบ</AlertTitle>
                <AlertDescription className="text-amber-700">
                  คุณมีคิวหมายเลข {existingQueueData.queueNumber} อยู่แล้วในระบบ 
                  {existingQueueData.department && ` ที่แผนก ${existingQueueData.department}`}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); checkExistingQueue(); }} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="เลขบัตรประชาชน 13 หลัก"
                  value={idCardNumber}
                  onChange={handleInputChange}
                  maxLength={13}
                  className="h-12 text-lg font-medium tracking-wider text-center input-highlight"
                  required
                  disabled={loading || checkingExisting}
                />
                {idCardNumber.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {idCardNumber.length === 13 ? (
                      <ClipboardCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">{idCardNumber.length}/13</span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {existingQueueData ? (
            <>
              <Button 
                onClick={useExistingQueue}
                className="w-full h-12 text-base hover-scale bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                ใช้คิวที่มีอยู่แล้ว
              </Button>
              
              <Button 
                onClick={() => setExistingQueueData(null)}
                variant="outline"
                className="w-full h-12 text-base"
              >
                ยกเลิกและลงทะเบียนใหม่
              </Button>
            </>
          ) : (
            <Button 
              onClick={checkExistingQueue}
              disabled={idCardNumber.length !== 13 || loading || checkingExisting} 
              className="w-full h-12 text-base hover-scale"
            >
              {loading || checkingExisting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {checkingExisting ? 'กำลังตรวจสอบ...' : 'กำลังประมวลผล...'}
                </>
              ) : (
                <>
                  รับคิว
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
