import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataManager } from '@/utils/dataManager';
import { ImportedScript, Issue } from '@/types';
import { Play, RotateCcw, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { ScriptExecution } from './ScriptExecution';
import { IssueView } from './IssueView';

interface TestLabProps {
  view: 'all-scripts' | 'completed' | 'pending' | 'scripts-with-issues';
}

export function TestLab({ view }: TestLabProps) {
  const [scripts, setScripts] = useState<ImportedScript[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [executingScript, setExecutingScript] = useState<ImportedScript | null>(null);
  const [viewingScript, setViewingScript] = useState<ImportedScript | null>(null);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = DataManager.loadData();
    setScripts(data.importedScripts);
    setIssues(data.issues);
    
    // Update viewing issue if it's currently open
    if (viewingIssue) {
      const updatedIssue = data.issues.find(issue => issue.id === viewingIssue.id);
      if (updatedIssue) {
        setViewingIssue(updatedIssue);
      }
    }
  };

  const getFilteredScripts = () => {
    switch (view) {
      case 'completed':
        return scripts.filter(s => s.status === 'Completed');
      case 'pending':
        return scripts.filter(s => s.status === 'Pending');
      case 'scripts-with-issues':
        return scripts.filter(s => s.status === 'Issue');
      default:
        return scripts;
    }
  };

  const getButtonForScript = (script: ImportedScript) => {
    if (script.status === 'Completed') {
      return (
        <Button
          onClick={() => setExecutingScript(script)}
          className="btn-secondary"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Retarget
        </Button>
      );
    }

    if (script.status === 'Issue' || (script.status === 'Pending' && script.remarks)) {
      return (
        <Button
          onClick={() => setExecutingScript(script)}
          className="btn-primary"
        >
          <Play className="h-4 w-4 mr-2" />
          Resume
        </Button>
      );
    }

    return (
      <Button
        onClick={() => setExecutingScript(script)}
        className="btn-primary"
      >
        <Play className="h-4 w-4 mr-2" />
        Start
      </Button>
    );
  };

  const getStatusBadge = (script: ImportedScript) => {
    switch (script.status) {
      case 'Completed':
        return (
          <span className="status-completed flex items-center gap-1 px-2 py-1 text-xs rounded border">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case 'Issue':
        return (
          <span className="status-issue flex items-center gap-1 px-2 py-1 text-xs rounded border">
            <AlertTriangle className="h-3 w-3" />
            Issue
          </span>
        );
      default:
        return (
          <span className="status-pending flex items-center gap-1 px-2 py-1 text-xs rounded border">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  const getScriptIssues = (script: ImportedScript) => {
    return script.issues.map(issueId => issues.find(i => i.id === issueId)).filter(Boolean) as Issue[];
  };

  const getViewTitle = () => {
    switch (view) {
      case 'completed':
        return 'Completed Scripts';
      case 'pending':
        return 'Pending Scripts';
      case 'scripts-with-issues':
        return 'Scripts with Issues';
      default:
        return 'All Scripts';
    }
  };

  const filteredScripts = getFilteredScripts();

  return (
    <div className="space-y-6">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>{getViewTitle()} ({filteredScripts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredScripts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scripts found for this view.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScripts.map(script => {
                const scriptIssues = getScriptIssues(script);
                return (
                  <div key={script.id} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-semibold text-primary">{script.scriptId}</span>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {script.testType}
                          </span>
                          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                            {script.testEnvironment}
                          </span>
                          {getStatusBadge(script)}
                        </div>
                        <p className="font-medium mb-1">{script.shortDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          Imported: {new Date(script.importedAt).toLocaleDateString()}
                        </p>
                        
                        {/* Show issues if any */}
                        {scriptIssues.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {scriptIssues.map(issue => (
                              <Dialog key={issue.id}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => setViewingIssue(issue)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Issue #{issue.issueNumber}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Issue #{issue.issueNumber}</DialogTitle>
                                  </DialogHeader>
                                  {viewingIssue && <IssueView issue={viewingIssue} onUpdate={loadData} />}
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        )}
                      </div>
                       
                       <div className="flex gap-2">
                         <Button
                           onClick={() => setViewingScript(script)}
                           variant="outline"
                           size="sm"
                         >
                           <Eye className="h-4 w-4 mr-2" />
                           View
                         </Button>
                         {getButtonForScript(script)}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Execution Dialog */}
      {executingScript && (
        <Dialog open={!!executingScript} onOpenChange={() => setExecutingScript(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {executingScript.status === 'Completed' ? 'Retarget' : 
                 (executingScript.status === 'Issue' || executingScript.remarks) ? 'Resume' : 'Start'} Script: {executingScript.scriptId}
              </DialogTitle>
            </DialogHeader>
            <ScriptExecution
              script={executingScript}
              onClose={() => {
                setExecutingScript(null);
                loadData();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Script View Dialog */}
      {viewingScript && (
        <Dialog open={!!viewingScript} onOpenChange={() => setViewingScript(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Script: {viewingScript.scriptId}</DialogTitle>
            </DialogHeader>
            <ScriptExecution
              script={viewingScript}
              isViewMode={true}
              onClose={() => setViewingScript(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}