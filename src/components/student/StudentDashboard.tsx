import React, { useState } from 'react';
import { Send, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from './FileUpload';
import PrintOptions from './PrintOptions';
import QueueStatus from './QueueStatus';
import NotificationTab from './NotificationTab';
import PaymentDialog from './PaymentDialog';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationHistory } from '@/hooks/useNotificationHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Priority, PrintColor, TIME_SLOTS } from '@/types/printJob';

const StudentDashboard: React.FC = () => {
  const { userId, user } = useAuth();
  const { addJob, getJobsByStudent, updateJobPayment, isLoading, forceRefresh, manualFetchJobs } = usePrintQueue();
  const { toast } = useToast();
  const { unreadCount } = useNotificationHistory();
  
  // Initialize notification system
  useNotifications();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePageCount, setSelectedFilePageCount] = useState<number>(0);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState<PrintColor>('black-white');
  const [priority, setPriority] = useState<Priority>('normal');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].id);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [paymentDialogJob, setPaymentDialogJob] = useState<any>(null);

  const myJobs = getJobsByStudent(userId || '');

  const handleFileSelect = (file: File, pageCount: number) => {
    setSelectedFile(file);
    setSelectedFilePageCount(pageCount);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setSelectedFilePageCount(0);
    setComment('');
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a PDF document first",
        variant: "destructive",
      });
      return;
    }

    if (!userId || !user?.email) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to submit a print job",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting job with parameters:', {
        userId: userId,
        email: user.email,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        pageCount: selectedFilePageCount,
        copies,
        color,
        priority,
        timeSlot,
        comment: comment.trim() ? `"${comment.trim()}"` : 'NO COMMENT'
      });

      // Submit job without file upload - just store file information
      const job = await addJob(
        userId,
        user.email,
        selectedFile.name,
        selectedFile.size,
        '', // No file URL - just store file info
        selectedFilePageCount,
        copies,
        color || 'black-white',
        priority,
        timeSlot,
        comment.trim() || undefined // Make sure we pass undefined for empty comments
      );

      console.log('Job submitted successfully:', job);

      setIsSubmitting(false);
      setSelectedFile(null);
      setSelectedFilePageCount(0);
      setCopies(1);
      setColor('black-white');
      setPriority('normal');
      setComment('');

      toast({
        title: "Print Job Submitted! 🎉",
        description: `Your 4-digit pickup code is: ${job.qrCode}. Complete payment to prioritize your job.`,
      });

      // Show payment dialog immediately after submission
      setPaymentDialogJob(job);

      // Switch to queue status tab to show the new job
      setTimeout(() => {
        setActiveTab('status');
        forceRefresh();
        manualFetchJobs();
      }, 500);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting job:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast({
        title: "Submission Failed",
        description: `${error.message || 'Unknown error occurred. Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (paymentId: string, amount: number) => {
    if (!paymentDialogJob) return;
    
    try {
      // Only update payment if amount > 0 (actual payment made)
      if (amount > 0) {
        await updateJobPayment(paymentDialogJob.id, paymentId, amount);
        
        toast({
          title: "Payment Successful! ✅",
          description: `Your job has been prioritized in the queue. Payment ID: ${paymentId}`,
        });
      } else {
        // Pay Later - just show job submitted message
        toast({
          title: "Job Submitted! 📄",
          description: "Your job has been added to the queue. You can pay later for priority processing.",
        });
      }
      
      setPaymentDialogJob(null);
      forceRefresh();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Payment Update Failed",
        description: "Payment was processed but job status update failed. Please contact admin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submit Print
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2 relative">
            Queue Status
            {myJobs.filter(j => j.status !== 'collected').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {myJobs.filter(j => j.status !== 'collected').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                pageCount={selectedFilePageCount}
                onClearFile={handleClearFile}
              />
            </CardContent>
          </Card>

          {selectedFile && (
            <>
              <PrintOptions
                copies={copies}
                setCopies={setCopies}
                color={color}
                setColor={setColor}
                priority={priority}
                setPriority={setPriority}
                timeSlot={timeSlot}
                setTimeSlot={setTimeSlot}
                comment={comment}
                setComment={setComment}
              />

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Print Request
                  </>
                )}
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="status">
          <QueueStatus 
            jobs={myJobs} 
            isLoading={isLoading} 
            onRefresh={() => {
              forceRefresh();
              manualFetchJobs();
            }}
            onPaymentClick={setPaymentDialogJob}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationTab />
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      {paymentDialogJob && (
        <PaymentDialog
          job={paymentDialogJob}
          isOpen={!!paymentDialogJob}
          onClose={() => setPaymentDialogJob(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
