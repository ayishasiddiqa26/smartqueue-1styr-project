import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from './FileUpload';
import PrintOptions from './PrintOptions';
import QueueStatus from './QueueStatus';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Priority, PrintColor, TIME_SLOTS } from '@/types/printJob';

const StudentDashboard: React.FC = () => {
  const { userId, user } = useAuth();
  const { addJob, getJobsByStudent } = usePrintQueue();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePageCount, setSelectedFilePageCount] = useState<number>(0);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState<PrintColor>('black-white');
  const [priority, setPriority] = useState<Priority>('normal');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].id);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myJobs = getJobsByStudent(userId || '');
  
  console.log('StudentDashboard - userId:', userId);
  console.log('StudentDashboard - myJobs:', myJobs);

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

    setIsSubmitting(true);
    
    try {
      console.log('Submitting job with parameters:', {
        userId: userId || 'anonymous',
        email: user?.email || 'unknown@email.com',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        pageCount: selectedFilePageCount,
        copies,
        color,
        priority,
        timeSlot,
        comment: comment.trim()
      });

      // Submit job without file upload - just store file information
      const job = await addJob(
        userId || 'anonymous',
        user?.email || 'unknown@email.com',
        selectedFile.name,
        selectedFile.size,
        '', // No file URL - just store file info
        selectedFilePageCount,
        copies,
        color || 'black-white',
        priority,
        timeSlot,
        comment.trim() || undefined
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
        description: `Your 4-digit pickup code is: ${job.qrCode}`,
      });
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
        description: `Failed to submit print job: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
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
                selectedFilePageCount={selectedFilePageCount}
                onClear={handleClearFile}
                isUploading={isSubmitting}
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
          <QueueStatus jobs={myJobs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
