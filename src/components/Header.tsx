import React from 'react';
import { Printer, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, role, user, logout } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/20 p-2 rounded-lg">
            <Printer className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">XeroQ</h1>
            <p className="text-xs text-primary-foreground/80">Campus Print Queue</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-primary-foreground/80 capitalize">
                {role === 'admin' ? 'Administrator' : 'Student'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
