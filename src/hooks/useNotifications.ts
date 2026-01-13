// Hook for managing student notifications
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePrintQueue } from './usePrintQueue';
import { notifyStudentJobReady, initializeNotifications } from '@/lib/notificationUtils';
import { PrintJob } from '@/types/printJob';

export const useNotifications = () => {
  const { isAuthenticated, role, userId } = useAuth();
  const { getAllJobs } = usePrintQueue();
  const previousJobsRef = useRef<PrintJob[]>([]);

  useEffect(() => {
    // Initialize notifications when component mounts
    if (isAuthenticated && role === 'student') {
      initializeNotifications();
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    // Only monitor for students
    if (!isAuthenticated || role !== 'student' || !userId) {
      return;
    }

    const currentJobs = getAllJobs();
    const previousJobs = previousJobsRef.current;

    // Check for status changes from 'printing' to 'printed'
    currentJobs.forEach(currentJob => {
      // Only check jobs belonging to this student
      if (currentJob.userId !== userId) return;

      const previousJob = previousJobs.find(job => job.id === currentJob.id);
      
      // Check if job status changed from 'printing' to 'printed'
      if (
        previousJob && 
        previousJob.status === 'printing' && 
        currentJob.status === 'printed'
      ) {
        // Send notification
        notifyStudentJobReady({
          jobId: currentJob.id,
          studentName: currentJob.studentName || 'Student',
          fileName: currentJob.fileName,
          qrCode: currentJob.qrCode,
          timestamp: new Date()
        });
      }
    });

    // Update previous jobs reference
    previousJobsRef.current = [...currentJobs];
  }, [getAllJobs, isAuthenticated, role, userId]);

  return {
    // Could return notification methods if needed
  };
};