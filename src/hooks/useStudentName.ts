import { useUserDetails } from './useUserDetails';
import { PrintJob } from '@/types/printJob';

export const useStudentName = (job: PrintJob | null) => {
  const { userDetails } = useUserDetails(job?.studentId || '');
  
  if (!job) return '';
  
  return job.studentEmail || userDetails?.email || job.studentId;
};