import React from 'react';
import { useUserDetails } from '@/hooks/useUserDetails';

interface StudentNameProps {
  studentId: string;
  studentEmail?: string;
  className?: string;
}

const StudentName: React.FC<StudentNameProps> = ({ studentId, studentEmail, className = "" }) => {
  const { userDetails, loading } = useUserDetails(studentId);

  // Debug logging
  console.log('StudentName Debug:', {
    studentId,
    studentEmail,
    userDetails,
    loading
  });

  if (loading) {
    return <span className={`animate-pulse bg-muted rounded w-24 h-4 inline-block ${className}`}></span>;
  }

  const displayName = studentEmail || userDetails?.email || studentId;
  
  return <span className={className}>{displayName}</span>;
};

export default StudentName;