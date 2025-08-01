import React from 'react';
import { Button } from '@/components/ui/button';
import { DataManager } from '@/utils/dataManager';
import { Issue } from '@/types';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IssueViewProps {
  issue: Issue;
  onUpdate: () => void;
}

export function IssueView({ issue, onUpdate }: IssueViewProps) {
  const { toast } = useToast();

  const handleStatusChange = (newStatus: 'Fixed' | 'Reopen') => {
    try {
      DataManager.updateIssue(issue.id, { status: newStatus });
      onUpdate();
      toast({
        title: "Success",
        description: `Issue marked as ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Issue Number</label>
          <p className="font-semibold">#{issue.issueNumber}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Status</label>
          <span className={`inline-block px-2 py-1 text-xs rounded ${
            issue.status === 'Open' ? 'bg-destructive/10 text-destructive' :
            issue.status === 'Fixed' ? 'bg-success/10 text-success' :
            'bg-warning/10 text-warning'
          }`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
        <div className="p-3 bg-secondary rounded-lg">
          <p className="whitespace-pre-wrap">{issue.description}</p>
        </div>
      </div>

      {issue.screenshots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Screenshots</label>
          <div className="grid grid-cols-2 gap-4">
            {issue.screenshots.map(screenshot => (
              <div key={screenshot.id} className="bg-secondary rounded-lg p-3">
                <img src={screenshot.path} alt={screenshot.fileName} className="w-full h-32 object-cover rounded" />
                <p className="text-xs mt-2">{screenshot.description || screenshot.fileName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        {issue.status === 'Open' && (
          <Button onClick={() => handleStatusChange('Fixed')} className="btn-primary">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Fixed
          </Button>
        )}
        {issue.status === 'Fixed' && (
          <Button onClick={() => handleStatusChange('Reopen')} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}