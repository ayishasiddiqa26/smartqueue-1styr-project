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
