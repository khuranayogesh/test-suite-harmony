import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Script, Folder } from '@/types';
import { DataManager } from '@/utils/dataManager';
import { Eye } from 'lucide-react';

interface ScriptViewProps {
  script: Script;
}

export function ScriptView({ script }: ScriptViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const data = DataManager.loadData();
  const folders = data.folders;

  const getFolderName = (folderId: string) => {
    return folders.find(f => f.id === folderId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Script ID</label>
          <p className="font-semibold">{script.scriptId}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Short Description</label>
          <p className="font-semibold">{script.shortDescription}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Folder</label>
          <p>{getFolderName(script.folderId)}</p>
        </div>
        {script.subfolderId && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Sub-folder</label>
            <p>{getFolderName(script.subfolderId)}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Test Environment</label>
          <p>{script.testEnvironment}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">Test Type</label>
          <p>{script.testType}</p>
        </div>
      </div>

      {/* Purpose */}
      {script.purpose && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Purpose</label>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="whitespace-pre-wrap">{script.purpose}</p>
          </div>
        </div>
      )}

      {/* Assumptions */}
      {script.assumptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Assumptions</label>
          <div className="p-3 bg-secondary rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {script.assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Expected Results */}
      {script.expectedResults && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Expected Results</label>
          <div className="p-3 bg-secondary rounded-lg">
            <p className="whitespace-pre-wrap">{script.expectedResults}</p>
          </div>
        </div>
      )}

      {/* Script Details */}
      {script.scriptDetails && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Script Details</label>
          <div className="p-3 bg-secondary rounded-lg max-h-64 overflow-y-auto">
            <p className="whitespace-pre-wrap">{script.scriptDetails}</p>
          </div>
        </div>
      )}

      {/* Screenshots */}
      {script.screenshots.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Screenshots</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {script.screenshots.map((screenshot, index) => (
              <div key={screenshot.id} className="bg-secondary rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{screenshot.fileName}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedImage(screenshot.path)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{screenshot.fileName}</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-y-auto">
                        <img 
                          src={screenshot.path} 
                          alt={screenshot.description || screenshot.fileName}
                          className="w-full h-auto rounded-lg"
                        />
                        {screenshot.description && (
                          <p className="mt-2 text-sm text-muted-foreground">{screenshot.description}</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <img 
                  src={screenshot.path} 
                  alt={screenshot.description || screenshot.fileName}
                  className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(screenshot.path)}
                />
                {screenshot.description && (
                  <p className="text-xs text-muted-foreground mt-2">{screenshot.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Created:</span> {new Date(script.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date(script.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}