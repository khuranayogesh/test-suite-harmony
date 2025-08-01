import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataManager } from '@/utils/dataManager';
import { ImportedScript, Screenshot, Issue } from '@/types';
import { CheckCircle, AlertTriangle, Save, X, Upload, Eye, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScriptExecutionProps {
  script: ImportedScript;
  onClose: () => void;
}

export function ScriptExecution({ script, onClose }: ScriptExecutionProps) {
  const [remarks, setRemarks] = useState(script.remarks || '');
  const [userScreenshots, setUserScreenshots] = useState<Screenshot[]>(script.userScreenshots || []);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showRaiseIssue, setShowRaiseIssue] = useState(false);
  const [showLinkIssue, setShowLinkIssue] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueScreenshots, setIssueScreenshots] = useState<Screenshot[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadIssues();
    // If retargeting a completed script, reset status
    if (script.status === 'Completed') {
      DataManager.updateImportedScript(script.id, { status: 'Pending' });
    }
  }, []);

  const loadIssues = () => {
    const data = DataManager.loadData();
    setIssues(data.issues.filter(i => i.status === 'Open' || i.status === 'Reopen'));
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>, isForIssue = false) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const screenshot: Screenshot = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          description: '',
          path: e.target?.result as string,
          uploadedAt: new Date().toISOString(),
        };
        
        if (isForIssue) {
          setIssueScreenshots(prev => [...prev, screenshot]);
        } else {
          setUserScreenshots(prev => [...prev, screenshot]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const updateScreenshotDescription = (id: string, description: string, isForIssue = false) => {
    if (isForIssue) {
      setIssueScreenshots(prev => 
        prev.map(s => s.id === id ? { ...s, description } : s)
      );
    } else {
      setUserScreenshots(prev => 
        prev.map(s => s.id === id ? { ...s, description } : s)
      );
    }
  };

  const removeScreenshot = (id: string, isForIssue = false) => {
    if (isForIssue) {
      setIssueScreenshots(prev => prev.filter(s => s.id !== id));
    } else {
      setUserScreenshots(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSave = () => {
    try {
      DataManager.updateImportedScript(script.id, {
        remarks,
        userScreenshots,
        status: 'Pending'
      });
      
      toast({
        title: "Success",
        description: "Script progress saved",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save script progress",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = () => {
    try {
      DataManager.updateImportedScript(script.id, {
        remarks,
        userScreenshots,
        status: 'Completed'
      });
      
      toast({
        title: "Success",
        description: "Script marked as completed",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark script as complete",
        variant: "destructive",
      });
    }
  };

  const handleRaiseIssue = () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter issue description",
        variant: "destructive",
      });
      return;
    }

    try {
      const newIssue = DataManager.addIssue({
        scriptId: script.id,
        description: issueDescription,
        screenshots: issueScreenshots,
        status: 'Open',
      });

      DataManager.linkIssueToScript(newIssue.id, script.id);
      
      DataManager.updateImportedScript(script.id, {
        remarks,
        userScreenshots,
        status: 'Issue'
      });

      toast({
        title: "Success",
        description: `Issue #${newIssue.issueNumber} raised successfully`,
      });
      
      setShowRaiseIssue(false);
      setIssueDescription('');
      setIssueScreenshots([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to raise issue",
        variant: "destructive",
      });
    }
  };

  const handleLinkExistingIssue = () => {
    if (!selectedIssueId) {
      toast({
        title: "Error",
        description: "Please select an issue to link",
        variant: "destructive",
      });
      return;
    }

    try {
      DataManager.linkIssueToScript(selectedIssueId, script.id);
      
      DataManager.updateImportedScript(script.id, {
        remarks,
        userScreenshots,
        status: 'Issue'
      });

      const linkedIssue = issues.find(i => i.id === selectedIssueId);
      toast({
        title: "Success",
        description: `Issue #${linkedIssue?.issueNumber} linked successfully`,
      });
      
      setShowLinkIssue(false);
      setSelectedIssueId('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link issue",
        variant: "destructive",
      });
    }
  };

  const scriptIssues = script.issues.map(id => issues.find(i => i.id === id)).filter(Boolean) as Issue[];

  return (
    <div className="space-y-6">
      {/* Show existing issues if any */}
      {scriptIssues.length > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h3 className="font-semibold text-destructive mb-2">Active Issues:</h3>
          <div className="space-y-2">
            {scriptIssues.map(issue => (
              <div key={issue.id} className="text-sm">
                <span className="font-medium">Issue #{issue.issueNumber}:</span> {issue.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script Details (readonly) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Script ID</Label>
            <p className="font-semibold">{script.scriptId}</p>
          </div>
          <div>
            <Label>Short Description</Label>
            <p className="font-semibold">{script.shortDescription}</p>
          </div>
          <div>
            <Label>Test Environment</Label>
            <p>{script.testEnvironment}</p>
          </div>
          <div>
            <Label>Test Type</Label>
            <p>{script.testType}</p>
          </div>
        </div>

        {script.purpose && (
          <div>
            <Label>Purpose</Label>
            <div className="p-3 bg-secondary rounded-lg mt-1">
              <p className="whitespace-pre-wrap">{script.purpose}</p>
            </div>
          </div>
        )}

        {script.assumptions.length > 0 && (
          <div>
            <Label>Assumptions</Label>
            <div className="p-3 bg-secondary rounded-lg mt-1">
              <ul className="list-disc list-inside space-y-1">
                {script.assumptions.map((assumption, index) => (
                  <li key={index}>{assumption}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {script.expectedResults && (
          <div>
            <Label>Expected Results</Label>
            <div className="p-3 bg-secondary rounded-lg mt-1">
              <p className="whitespace-pre-wrap">{script.expectedResults}</p>
            </div>
          </div>
        )}

        {script.scriptDetails && (
          <div>
            <Label>Script Details</Label>
            <div className="p-3 bg-secondary rounded-lg mt-1 max-h-64 overflow-y-auto">
              <p className="whitespace-pre-wrap">{script.scriptDetails}</p>
            </div>
          </div>
        )}

        {/* Original Screenshots */}
        {script.screenshots.length > 0 && (
          <div>
            <Label>Reference Screenshots</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {script.screenshots.map((screenshot) => (
                <div key={screenshot.id} className="bg-secondary rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{screenshot.fileName}</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{screenshot.fileName}</DialogTitle>
                        </DialogHeader>
                        <img 
                          src={screenshot.path} 
                          alt={screenshot.description || screenshot.fileName}
                          className="w-full h-auto rounded-lg"
                        />
                        {screenshot.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{screenshot.description}</p>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <img 
                    src={screenshot.path} 
                    alt={screenshot.description || screenshot.fileName}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  {screenshot.description && (
                    <p className="text-xs text-muted-foreground mt-2">{screenshot.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Input Section */}
      <div className="border-t border-border pt-6 space-y-4">
        <div>
          <Label htmlFor="remarks">Remarks (if any)</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks about the test execution"
            className="form-input mt-1"
            rows={4}
          />
        </div>

        {/* User Screenshots */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Add Screenshots (if any)</Label>
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleScreenshotUpload(e, false)}
                className="hidden"
                id="user-screenshot-upload"
              />
              <Button
                type="button"
                onClick={() => document.getElementById('user-screenshot-upload')?.click()}
                size="sm"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Screenshots
              </Button>
            </div>
          </div>
          
          {userScreenshots.length > 0 && (
            <div className="space-y-3">
              {userScreenshots.map(screenshot => (
                <div key={screenshot.id} className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{screenshot.fileName}</span>
                    <Button
                      type="button"
                      onClick={() => removeScreenshot(screenshot.id, false)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={screenshot.description}
                    onChange={(e) => updateScreenshotDescription(screenshot.id, e.target.value, false)}
                    placeholder="Enter screenshot description"
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Button onClick={handleMarkComplete} className="btn-primary">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Complete
        </Button>
        
        <Button onClick={() => setShowRaiseIssue(true)} variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Raise Issue
        </Button>

        {issues.length > 0 && (
          <Button onClick={() => setShowLinkIssue(true)} variant="outline">
            <Link className="h-4 w-4 mr-2" />
            Link Existing Issue
          </Button>
        )}
        
        <Button onClick={handleSave} variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Button onClick={onClose} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Raise Issue Dialog */}
      {showRaiseIssue && (
        <Dialog open={showRaiseIssue} onOpenChange={setShowRaiseIssue}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Raise New Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="issueDesc">Issue Description</Label>
                <Textarea
                  id="issueDesc"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the issue"
                  className="form-input"
                  rows={4}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Screenshots (if any)</Label>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleScreenshotUpload(e, true)}
                      className="hidden"
                      id="issue-screenshot-upload"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('issue-screenshot-upload')?.click()}
                      size="sm"
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Screenshots
                    </Button>
                  </div>
                </div>
                
                {issueScreenshots.length > 0 && (
                  <div className="space-y-3">
                    {issueScreenshots.map(screenshot => (
                      <div key={screenshot.id} className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{screenshot.fileName}</span>
                          <Button
                            type="button"
                            onClick={() => removeScreenshot(screenshot.id, true)}
                            size="sm"
                            variant="outline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={screenshot.description}
                          onChange={(e) => updateScreenshotDescription(screenshot.id, e.target.value, true)}
                          placeholder="Enter screenshot description"
                          className="form-input"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleRaiseIssue} className="btn-primary">
                  Raise Issue
                </Button>
                <Button onClick={() => setShowRaiseIssue(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Link Existing Issue Dialog */}
      {showLinkIssue && (
        <Dialog open={showLinkIssue} onOpenChange={setShowLinkIssue}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Existing Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="existingIssue">Select Issue</Label>
                <select
                  id="existingIssue"
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select an issue</option>
                  {issues.map(issue => (
                    <option key={issue.id} value={issue.id}>
                      Issue #{issue.issueNumber}: {issue.description.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleLinkExistingIssue} className="btn-primary">
                  Link Issue
                </Button>
                <Button onClick={() => setShowLinkIssue(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}