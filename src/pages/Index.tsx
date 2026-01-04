import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';
import StudentDashboard from '@/components/student/StudentDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
};

const Index: React.FC = () => {
  return <AppContent />;
};

export default Index;
