import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-light">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="bg-white border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-primary">
              {getPageTitle(currentPage)}
            </h1>
          </div>
        </div>
        
        {/* Page content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function getPageTitle(page: string): string {
  const titles: Record<string, string> = {
    'scripts-listing': 'Scripts Listing',
    'add-script': 'Add a Script',
    'add-folder': 'Add a Folder',
    'add-subfolder': 'Add a Sub-folder',
    'import-scripts': 'Import Test Scripts',
    'all-scripts': 'All Scripts',
    'completed': 'Completed Scripts',
    'pending': 'Pending Scripts',
    'scripts-with-issues': 'Scripts with Issues',
    'issue-log': 'Issue Log',
  };
  
  return titles[page] || 'Dashboard';
}