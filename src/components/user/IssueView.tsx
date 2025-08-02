import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataManager } from '@/utils/dataManager';
import { Issue, Screenshot } from '@/types';
import { CheckCircle, RotateCcw, Save, Eye, ZoomIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IssueViewProps {
  issue: Issue;
  onUpdate: () => void;
}

export function IssueView({ issue, onUpdate }: IssueViewProps) {
  const { toast } = useToast();
  const [resolution, setResolution] = useState(issue.resolution || '');

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

  const handleResolutionSave = () => {
    try {
      DataManager.updateIssue(issue.id, { resolution });
      onUpdate();
      toast({
        title: "Success",
        description: "Resolution saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resolution",
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
              <div key={screenshot.id} className="bg-secondary rounded-lg p-3 relative group">
                <img src={screenshot.path} alt={screenshot.fileName} className="w-full h-32 object-cover rounded" />
                <p className="text-xs mt-2">{screenshot.description || screenshot.fileName}</p>
                
                {/* View Screenshot Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{screenshot.fileName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <img 
                        src={screenshot.path} 
                        alt={screenshot.fileName} 
                        className="w-full max-h-[70vh] object-contain rounded"
                      />
                      {screenshot.description && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                          <p className="text-sm">{screenshot.description}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Resolution</label>
        <Textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Enter resolution details..."
          className="min-h-20"
        />
        <Button
          onClick={handleResolutionSave}
          size="sm"
          className="mt-2"
          disabled={resolution === (issue.resolution || '')}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Resolution
        </Button>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        {(issue.status === 'Open' || issue.status === 'Reopen') && (
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