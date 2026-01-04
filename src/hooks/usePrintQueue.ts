import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import { PrintJob, PrintJobStatus, Priority, PrintColor } from '@/types/printJob';

const COLLECTION_NAME = 'printJobs';

const generateUniqueCode = (existingJobs: PrintJob[]): string => {
  const existingCodes = new Set(existingJobs.map(job => job.qrCode));
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
    
    if (attempts > maxAttempts) {
      console.warn('Max attempts reached for unique code generation, using timestamp fallback');
      code = (Date.now() % 10000).toString().padStart(4, '0');
      break;
    }
  } while (existingCodes.has(code));
  
  console.log(`Generated unique code: ${code} (attempts: ${attempts})`);
  return code;
};
const USERS_COLLECTION = 'users';

const calculateQueuePositions = (jobs: PrintJob[]): PrintJob[] => {
  const activeJobs = jobs.filter(j => j.status === 'waiting' || j.status === 'printing');
  
  // Sort by priority (urgent first), then by timestamp
  const sorted = [...activeJobs].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'urgent' ? -1 : 1;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return jobs.map(job => {
    const position = sorted.findIndex(j => j.id === job.id) + 1;
    const estimatedWait = position > 0 ? position * 3 : 0; // 3 min per job estimate
    return { ...job, queuePosition: position, estimatedWait };
  });
};

const convertFirestoreJob = (docSnapshot: any): PrintJob => {
  const data = docSnapshot.data();
  
  console.log('Converting job:', {
    jobId: docSnapshot.id,
    studentId: data.studentId,
    studentEmail: data.studentEmail,
    fileName: data.fileName
  });
  
  return {
    ...data,
    id: docSnapshot.id,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

export const usePrintQueue = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for all print jobs
  useEffect(() => {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firestore snapshot received:', snapshot.docs.length, 'documents');
      
      const jobsData = snapshot.docs.map(convertFirestoreJob);
      
      console.log('Converted jobs:', jobsData);
      setJobs(calculateQueuePositions(jobsData));
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching print jobs:', error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const addJob = useCallback(async (
    studentId: string,
    studentEmail: string,
    fileName: string,
    fileSize: number,
    fileUrl: string,
    pageCount: number,
    copies: number,
    color: PrintColor,
    priority: Priority,
    timeSlot: string,
    studentComment?: string
  ): Promise<PrintJob> => {
    // Generate a unique 4-digit numeric code
    const qrCode = generateUniqueCode(jobs);
    console.log('Generated 4-digit code:', qrCode);
    console.log('Creating job with data:', {
      studentId,
      studentEmail,
      fileName,
      fileSize,
      fileUrl,
      pageCount,
      copies,
      color,
      priority,
      timeSlot,
      studentComment,
      qrCode
    });
    
    const jobData = {
      studentId,
      studentEmail, // Store email directly in job data
      fileName,
      fileSize,
      fileUrl,
      pageCount,
      copies,
      color,
      priority,
      timeSlot,
      studentComment: studentComment || '',
      adminComments: [],
      requiresStudentAction: false,
      status: 'waiting' as PrintJobStatus,
      createdAt: serverTimestamp(),
      qrCode,
      estimatedWait: 0,
      queuePosition: 0,
    };

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), jobData);
      console.log('Job created successfully with ID:', docRef.id);
      
      // Return the job with the generated ID and current timestamp
      const result = {
        ...jobData,
        id: docRef.id,
        createdAt: new Date(),
      } as PrintJob;
      
      console.log('Returning job:', result);
      return result;
    } catch (error) {
      console.error('Error adding print job:', error);
      throw error;
    }
  }, [jobs]);

  const updateJobStatus = useCallback(async (jobId: string, status: PrintJobStatus) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, jobId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }, []);

  const addAdminComment = useCallback(async (jobId: string, message: string, requiresAction: boolean = false) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');

      const newComment = {
        id: Date.now().toString(),
        message,
        createdAt: new Date(),
        requiresAction
      };

      const updatedComments = [...(job.adminComments || []), newComment];

      await updateDoc(doc(db, COLLECTION_NAME, jobId), {
        adminComments: updatedComments,
        requiresStudentAction: requiresAction,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding admin comment:', error);
      throw error;
    }
  }, [jobs]);

  const clearStudentAction = useCallback(async (jobId: string) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, jobId), {
        requiresStudentAction: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error clearing student action flag:', error);
      throw error;
    }
  }, []);

  const getJobByQrCode = useCallback((qrCode: string): PrintJob | undefined => {
    return jobs.find(job => job.qrCode === qrCode);
  }, [jobs]);

  const getJobsByStudent = useCallback((studentId: string): PrintJob[] => {
    console.log('Getting jobs for student:', studentId);
    console.log('All jobs:', jobs);
    const studentJobs = jobs.filter(job => job.studentId === studentId);
    console.log('Student jobs:', studentJobs);
    return studentJobs;
  }, [jobs]);

  const getActiveJobs = useCallback((): PrintJob[] => {
    return jobs.filter(job => job.status === 'waiting' || job.status === 'printing');
  }, [jobs]);

  const getAllJobs = useCallback((): PrintJob[] => {
    return [...jobs].sort((a, b) => {
      // Sort by status, then priority, then timestamp
      const statusOrder = { printing: 0, waiting: 1, printed: 2, collected: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (a.priority !== b.priority) {
        return a.priority === 'urgent' ? -1 : 1;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [jobs]);

  return {
    jobs,
    isLoading,
    addJob,
    updateJobStatus,
    addAdminComment,
    clearStudentAction,
    getJobByQrCode,
    getJobsByStudent,
    getActiveJobs,
    getAllJobs,
  };
};
