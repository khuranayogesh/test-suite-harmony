import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from './Layout';
import { AddFolder } from './admin/AddFolder';
import { AddScript } from './admin/AddScript';
import { ScriptsListing } from './admin/ScriptsListing';
import { ImportScripts } from './user/ImportScripts';
import { TestLab } from './user/TestLab';
import { IssueLog } from './user/IssueLog';

export function Dashboard() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(
    user?.userType === 'Administrator' ? 'scripts-listing' : 'import-scripts'
  );

  const renderPage = () => {
    switch (currentPage) {
      // Admin pages
      case 'scripts-listing':
        return <ScriptsListing />;
      case 'add-script':
        return <AddScript />;
      case 'add-folder':
        return <AddFolder />;
      case 'add-subfolder':
        return <AddFolder isSubfolder={true} />;
      
      // User pages
      case 'import-scripts':
        return <ImportScripts />;
      case 'all-scripts':
        return <TestLab view="all-scripts" />;
      case 'completed':
        return <TestLab view="completed" />;
      case 'pending':
        return <TestLab view="pending" />;
      case 'scripts-with-issues':
        return <TestLab view="scripts-with-issues" />;
      case 'issue-log':
        return <IssueLog />;
      
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}