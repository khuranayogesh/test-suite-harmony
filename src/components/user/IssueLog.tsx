import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataManager } from '@/utils/dataManager';
import { Issue } from '@/types';
import { Eye } from 'lucide-react';
import { IssueView } from './IssueView';

export function IssueLog() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = () => {
    const data = DataManager.loadData();
    setIssues(data.issues);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-destructive bg-destructive/10';
      case 'Fixed': return 'text-success bg-success/10';
      case 'Reopen': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Issue Log ({issues.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No issues found.
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => (
              <div key={issue.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold">Issue #{issue.issueNumber}</span>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{issue.description.substring(0, 100)}...</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setViewingIssue(issue)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Issue #{issue.issueNumber}</DialogTitle>
                      </DialogHeader>
                      {viewingIssue && <IssueView issue={viewingIssue} onUpdate={loadIssues} />}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}