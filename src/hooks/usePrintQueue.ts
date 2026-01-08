import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/firebase';
import { PrintJob, PrintJobStatus, Priority, PrintColor } from '@/types/printJob';
import { getAIRecommendation, getMockPrinterStatus, calculatePrinterStatus, JobAnalysisInput } from '@/lib/geminiAI';

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

const calculateQueuePositions = (jobs: PrintJob[]): PrintJob[] => {
  const activeJobs = jobs.filter(j => j.status === 'waiting' || j.status === 'printing');
  
  // Enhanced sorting with AI priority levels
  const sorted = [...activeJobs].sort((a, b) => {
    // First by payment status (paid jobs first)
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? -1 : 1;
    }
    
    // Then by AI priority level (High > Medium > Low)
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    const aPriority = priorityOrder[a.aiPriorityLevel || 'Low'];
    const bPriority = priorityOrder[b.aiPriorityLevel || 'Low'];
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Then by job priority (urgent first)
    if (a.priority !== b.priority) {
      return a.priority === 'urgent' ? -1 : 1;
    }
    
    // Finally by creation time (oldest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return jobs.map(job => {
    const position = sorted.findIndex(j => j.id === job.id) + 1;
    // Use AI estimated wait time if available, otherwise fallback to simple calculation
    const estimatedWait = job.aiEstimatedWait || (position > 0 ? position * 3 : 0);
    return { ...job, queuePosition: position, estimatedWait };
  });
};

export const usePrintQueue = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log('Force refreshing jobs...');
    setLastRefresh(Date.now());
  }, []);

  // Real-time listener for all print jobs
  useEffect(() => {
    console.log('Setting up Firestore listener...');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firestore snapshot received:', snapshot.docs.length, 'documents');
      console.log('Snapshot metadata:', snapshot.metadata);
      
      if (snapshot.empty) {
        console.log('No documents found in printJobs collection');
        setJobs([]);
        setIsLoading(false);
        return;
      }
      
      const jobsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Processing job document:', doc.id, {
          studentComment: data.studentComment ? `"${data.studentComment}"` : 'NO COMMENT',
          hasStudentComment: !!data.studentComment,
          studentCommentType: typeof data.studentComment,
          studentCommentLength: data.studentComment?.length || 0
        });
        
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as PrintJob;
      });
      
      console.log('Converted jobs:', jobsData);
      const calculatedJobs = calculateQueuePositions(jobsData);
      console.log('Jobs with queue positions:', calculatedJobs);
      
      setJobs(calculatedJobs);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching print jobs:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [lastRefresh]);

  // Manual fetch function for debugging
  const manualFetchJobs = useCallback(async () => {
    try {
      console.log('Manual fetch started...');
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      console.log('Manual fetch result:', snapshot.docs.length, 'documents');
      
      const jobsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as PrintJob;
      });
      
      console.log('Manual fetch jobs:', jobsData);
      const calculatedJobs = calculateQueuePositions(jobsData);
      setJobs(calculatedJobs);
      return calculatedJobs;
    } catch (error) {
      console.error('Manual fetch error:', error);
      return [];
    }
  }, []);

  // Backup polling mechanism in case real-time listener fails
  useEffect(() => {
    if (jobs.length === 0 && !isLoading) {
      console.log('No jobs found, starting backup polling...');
      const pollInterval = setInterval(() => {
        console.log('Polling for jobs...');
        manualFetchJobs();
      }, 5000); // Poll every 5 seconds

      // Clear polling after 30 seconds
      const clearPolling = setTimeout(() => {
        clearInterval(pollInterval);
        console.log('Stopped backup polling');
      }, 30000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(clearPolling);
      };
    }
  }, [jobs.length, isLoading, manualFetchJobs]);

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
    try {
      // Validate required parameters
      if (!studentId || !studentEmail || !fileName) {
        throw new Error('Missing required parameters: studentId, studentEmail, or fileName');
      }

      // Generate a unique 4-digit numeric code
      const qrCode = generateUniqueCode(jobs);
      console.log('Generated 4-digit code:', qrCode);
      
      // Get AI recommendation for printer assignment and wait time
      console.log('🤖 Getting AI recommendation for job...');
      
      // Calculate real printer status from current jobs
      const printerStatus = calculatePrinterStatus(jobs);
      console.log('📊 Current printer status:', printerStatus);
      
      const aiInput: JobAnalysisInput = {
        pageCount,
        isUrgent: priority === 'urgent',
        isPaid: false, // Initially unpaid
        currentQueueLength: jobs.filter(j => j.status === 'waiting').length,
        printer1: printerStatus.printer1,
        printer2: printerStatus.printer2,
        submissionTime: new Date(),
      };
      
      const aiRecommendation = await getAIRecommendation(aiInput);
      console.log('🤖 AI Recommendation received:', aiRecommendation);
      
      const jobData: any = {
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
        adminComments: [],
        requiresStudentAction: false,
        status: 'waiting' as PrintJobStatus,
        createdAt: serverTimestamp(),
        qrCode,
        estimatedWait: aiRecommendation.estimatedWaitTime,
        queuePosition: 0,
        // Initialize payment fields - use null instead of undefined for Firestore
        isPaid: false,
        paymentAmount: null,
        paymentTimestamp: null,
        paymentId: null,
        // AI recommendation fields
        assignedPrinter: aiRecommendation.assignedPrinter,
        aiEstimatedWait: aiRecommendation.estimatedWaitTime,
        aiPriorityLevel: aiRecommendation.priorityLevel,
        aiReasoning: aiRecommendation.reasoning,
        aiConfidence: aiRecommendation.confidence,
      };

      // Only add studentComment if it has a value
      if (studentComment && studentComment.trim()) {
        jobData.studentComment = studentComment.trim();
        console.log('✅ Adding student comment to job:', studentComment.trim());
      } else {
        console.log('❌ No student comment to add');
      }

      console.log('Creating job with AI data:', {
        ...jobData,
        studentComment: jobData.studentComment ? `"${jobData.studentComment}"` : 'NO COMMENT'
      });
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), jobData);
      console.log('Job created successfully with ID:', docRef.id);
      
      // Force refresh after job creation
      setTimeout(() => {
        forceRefresh();
        manualFetchJobs();
      }, 1000);
      
      // Return the job with the generated ID and current timestamp
      const result = {
        ...jobData,
        id: docRef.id,
        createdAt: new Date(),
      } as PrintJob;
      
      console.log('Returning job with AI recommendations:', result);
      return result;
    } catch (error) {
      console.error('Error adding print job:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please make sure you are logged in as a student.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be logged in to submit a print job.');
      } else if (error.code === 'invalid-argument') {
        throw new Error('Invalid data provided. Please check your input and try again.');
      } else {
        throw new Error(`Failed to submit print job: ${error.message || 'Unknown error'}`);
      }
    }
  }, [jobs, forceRefresh, manualFetchJobs]);

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
    if (!studentId) {
      return [];
    }
    
    const studentJobs = jobs.filter(job => job.studentId === studentId);
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

  const updateJobPayment = useCallback(async (
    jobId: string,
    paymentId: string,
    amount: number
  ) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, jobId), {
        isPaid: true,
        paymentAmount: amount,
        paymentTimestamp: serverTimestamp(),
        paymentId: paymentId,
        updatedAt: serverTimestamp()
      });
      
      // Force refresh to update queue positions
      setTimeout(() => {
        forceRefresh();
      }, 500);
    } catch (error) {
      console.error('Error updating job payment:', error);
      throw error;
    }
  }, []);

  return {
    jobs,
    isLoading,
    addJob,
    updateJobStatus,
    updateJobPayment,
    addAdminComment,
    clearStudentAction,
    getJobByQrCode,
    getJobsByStudent,
    getActiveJobs,
    getAllJobs,
    forceRefresh,
    manualFetchJobs,
  };
};
