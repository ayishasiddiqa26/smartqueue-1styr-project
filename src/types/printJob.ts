export type PrintJobStatus = 'waiting' | 'printing' | 'printed' | 'collected';
export type Priority = 'normal' | 'urgent';
export type PrintColor = 'black-white' | 'color';

export interface PrintJob {
  id: string;
  studentId: string;
  studentEmail?: string; // Add email field
  fileName: string;
  fileSize: number;
  fileUrl?: string; // URL for viewing/downloading the file
  pageCount?: number; // Number of pages in the document
  copies: number;
  color: PrintColor;
  priority: Priority;
  timeSlot: string;
  status: PrintJobStatus;
  createdAt: Date;
  qrCode: string;
  estimatedWait: number; // in minutes
  queuePosition: number;
  studentComment?: string; // Optional comment from student
  adminComments?: AdminComment[]; // Comments from admin
  requiresStudentAction?: boolean; // Flag to indicate student needs to take action
  // Payment fields for hackathon demo
  isPaid: boolean; // Payment status (required for queue priority)
  paymentAmount?: number | null; // Demo amount in rupees
  paymentTimestamp?: Date | null; // When payment was completed
  paymentId?: string | null; // Demo payment reference ID
  
  // AI-powered printer assignment and optimization
  assignedPrinter?: 'printer1' | 'printer2'; // AI-assigned printer
  aiEstimatedWait?: number; // AI-calculated wait time in minutes
  aiPriorityLevel?: 'High' | 'Medium' | 'Low'; // AI-determined priority
  aiReasoning?: string; // AI explanation for assignment
  aiConfidence?: number; // AI confidence level (0-100%)
}

export interface AdminComment {
  id: string;
  message: string;
  createdAt: Date;
  requiresAction?: boolean; // Whether this comment requires student action
}

export interface TimeSlot {
  id: string;
  label: string;
  time: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: '1', label: 'Morning Break', time: '10:00 AM - 10:30 AM' },
  { id: '2', label: 'Lunch Break', time: '12:30 PM - 1:30 PM' },
  { id: '4', label: 'After Classes', time: '3:30 PM - 8:00 PM' },
];
