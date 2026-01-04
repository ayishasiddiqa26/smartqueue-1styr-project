import React from 'react';
import { Settings, Database, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ConfigurationRequired: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Settings className="h-12 w-12 text-primary animate-spin" />
          </div>
          <CardTitle className="text-3xl font-bold">XeroQ</CardTitle>
          <CardDescription className="text-lg">Campus Print Queue Management System</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">🔧 Configuration Required</h2>
            <p className="text-muted-foreground mb-6">
              This application requires Firebase configuration to function properly.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-medium">Firebase Setup</h3>
                <p className="text-sm text-muted-foreground">Configure Firebase project credentials</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-medium">Authentication</h3>
                <p className="text-sm text-muted-foreground">Enable Firebase Authentication service</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">📋 Setup Instructions:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Create a Firebase project at console.firebase.google.com</li>
              <li>2. Enable Authentication and Firestore Database</li>
              <li>3. Copy your Firebase config to src/firebase.ts</li>
              <li>4. Deploy Firestore security rules</li>
              <li>5. Start using XeroQ!</li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              For detailed setup instructions, check the 
              <span className="font-medium text-primary"> FIREBASE_DEPLOYMENT_GUIDE.md</span> file.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationRequired;