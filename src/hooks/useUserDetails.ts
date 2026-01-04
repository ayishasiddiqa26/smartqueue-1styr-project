import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface UserDetails {
  email: string;
  role: string;
  studentId?: string;
}

const userCache = new Map<string, UserDetails>();

export const useUserDetails = (userId: string) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Check cache first
      if (userCache.has(userId)) {
        setUserDetails(userCache.get(userId)!);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        console.log('Fetching user details for:', userId);
        console.log('User document exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const details = userDoc.data() as UserDetails;
          console.log('User document data:', details);
          userCache.set(userId, details);
          setUserDetails(details);
        } else {
          console.log('No user document found for:', userId);
          setUserDetails(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return { userDetails, loading };
};

// Helper function to get display name
export const getDisplayName = (job: { studentId: string; studentEmail?: string }, userDetails?: UserDetails | null): string => {
  if (job.studentEmail) return job.studentEmail;
  if (userDetails?.email) return userDetails.email;
  return job.studentId;
};