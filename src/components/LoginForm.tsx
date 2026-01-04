import React, { useState } from 'react';
import { User, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [activeTab, setActiveTab] = useState('student');
  const { login, register, loading } = useAuth();
  const { toast } = useToast();

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isRegistering && !studentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter your student ID",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isRegistering) {
        await register(email, password, 'student', studentId);
        toast({
          title: "Registration Successful!",
          description: "Your account has been created",
        });
      } else {
        await login(email, password, 'student');
        toast({
          title: "Welcome!",
          description: "Successfully logged in",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isRegistering) {
        await register(email, password, 'admin');
        toast({
          title: "Admin Account Created!",
          description: "Your admin account has been created",
        });
      } else {
        await login(email, password, 'admin');
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin dashboard",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <svg 
              viewBox="0 0 24 24" 
              className="h-12 w-12 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="6" y="2" width="12" height="6" rx="1" />
              <rect x="4" y="8" width="16" height="10" rx="1" />
              <path d="M8 18v4h8v-4" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="15" x2="12" y2="15" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">XeroQ</CardTitle>
          <CardDescription>Campus Print Queue Management</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <form onSubmit={handleStudentAuth} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg"
                  />
                </div>
                {isRegistering && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Student ID
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., CS2024001"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Processing..." : isRegistering ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "Already have an account? Sign in" : "Need an account? Register"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Processing..." : isRegistering ? "Create Admin Account" : "Access Dashboard"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "Already have an account? Sign in" : "Need an account? Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
