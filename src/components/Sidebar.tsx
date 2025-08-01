import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  FolderPlus, 
  FilePlus, 
  List, 
  LogOut, 
  Download, 
  FlaskConical, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const [masterExpanded, setMasterExpanded] = useState(true);
  const [testLabExpanded, setTestLabExpanded] = useState(true);

  const adminMenuItems = [
    {
      id: 'master',
      label: 'Master',
      icon: Settings,
      expandable: true,
      expanded: masterExpanded,
      onToggle: () => setMasterExpanded(!masterExpanded),
      subItems: [
        { id: 'scripts-listing', label: 'Scripts Listing', icon: List },
        { id: 'add-script', label: 'Add a Script', icon: FilePlus },
        { id: 'add-folder', label: 'Add a Folder', icon: FolderPlus },
        { id: 'add-subfolder', label: 'Add a Sub-folder', icon: FolderPlus },
      ]
    }
  ];

  const userMenuItems = [
    { id: 'import-scripts', label: 'Import Test Scripts', icon: Download },
    {
      id: 'test-lab',
      label: 'Test Lab',
      icon: FlaskConical,
      expandable: true,
      expanded: testLabExpanded,
      onToggle: () => setTestLabExpanded(!testLabExpanded),
      subItems: [
        { id: 'all-scripts', label: 'All Scripts', icon: List },
        { id: 'completed', label: 'Completed', icon: List },
        { id: 'pending', label: 'Pending', icon: List },
        { id: 'scripts-with-issues', label: 'Scripts having Issues', icon: AlertTriangle },
      ]
    },
    { id: 'issue-log', label: 'Issue Log', icon: AlertTriangle }
  ];

  const menuItems = user?.userType === 'Administrator' ? adminMenuItems : userMenuItems;

  const renderMenuItem = (item: any, isSubItem = false) => {
    const isActive = currentPage === item.id;
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div key={item.id} className={cn('', isSubItem && 'ml-4')}>
        <button
          onClick={() => {
            if (hasSubItems && item.onToggle) {
              item.onToggle();
            } else {
              onPageChange(item.id);
            }
          }}
          className={cn(
            'sidebar-item w-full justify-between',
            isActive && 'active',
            isSubItem && 'text-sm pl-6'
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
          {hasSubItems && (
            item.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {hasSubItems && item.expanded && (
          <div className="mt-1 space-y-1">
            {item.subItems.map((subItem: any) => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-border z-50 transition-transform duration-300 ease-in-out',
        'w-72 shadow-lg',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="gradient-primary p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Regression Assistant</h2>
                <p className="text-white/80 text-sm">{user?.userType}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}