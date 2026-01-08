import React from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DemoDisclaimer: React.FC = () => {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Trophy className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="font-semibold">🏆 Hackathon Demo Version</p>
            <p className="text-sm mt-1">
              This XeroQ application includes a <strong>simulated payment system</strong> for demonstration purposes only. 
              No real money is processed or charged. All payment transactions are mock operations designed to showcase 
              the queue prioritization feature for judges and participants.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DemoDisclaimer;