import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataManager } from '@/utils/dataManager';
import { Folder } from '@/types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddFolderProps {
  isSubfolder?: boolean;
}

export function AddFolder({ isSubfolder = false }: AddFolderProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [parentFolderId, setParentFolderId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, [isSubfolder]);

  const loadFolders = () => {
    const data = DataManager.loadData();
    if (isSubfolder) {
      setFolders(data.folders.filter(f => f.isSubfolder));
    } else {
      setFolders(data.folders.filter(f => !f.isSubfolder));
    }
  };

  const getParentFolders = () => {
    const data = DataManager.loadData();
    return data.folders.filter(f => !f.isSubfolder);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    if (isSubfolder && !parentFolderId) {
      toast({
        title: "Error",
        description: "Please select a parent folder",
        variant: "destructive",
      });
      return;
    }

    try {
      DataManager.addFolder(newFolderName.trim(), isSubfolder ? parentFolderId : undefined);
      setNewFolderName('');
      setParentFolderId('');
      loadFolders();
      toast({
        title: "Success",
        description: `${isSubfolder ? 'Sub-folder' : 'Folder'} added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add folder",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFolder = (id: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid name",
        variant: "destructive",
      });
      return;
    }

    try {
      DataManager.updateFolder(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      loadFolders();
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = (id: string) => {
    if (window.confirm('Are you sure you want to delete this folder? This will also delete all scripts in this folder.')) {
      try {
        DataManager.deleteFolder(id);
        loadFolders();
        toast({
          title: "Success",
          description: "Folder deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete folder",
          variant: "destructive",
        });
      }
    }
  };

  const startEditing = (folder: Folder) => {
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const parentFolders = getParentFolders();

  return (
    <div className="space-y-6">
      {/* Add new folder */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Add New {isSubfolder ? 'Sub-folder' : 'Folder'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSubfolder && (
            <div>
              <Label htmlFor="parentFolder">Parent Folder</Label>
              <select
                id="parentFolder"
                value={parentFolderId}
                onChange={(e) => setParentFolderId(e.target.value)}
                className="form-select"
              >
                <option value="">Select a parent folder</option>
                {parentFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <Label htmlFor="folderName">{isSubfolder ? 'Sub-folder' : 'Folder'} Name</Label>
            <div className="flex gap-2">
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={`Enter ${isSubfolder ? 'sub-folder' : 'folder'} name`}
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
              />
              <Button onClick={handleAddFolder} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing folders */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Existing {isSubfolder ? 'Sub-folders' : 'Folders'}</CardTitle>
        </CardHeader>
        <CardContent>
          {folders.length === 0 ? (
            <Alert>
              <AlertDescription>
                No {isSubfolder ? 'sub-folders' : 'folders'} found. Add one above to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {folders.map(folder => (
                <div key={folder.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  {editingId === folder.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="form-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder(folder.id)}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateFolder(folder.id)}
                        className="btn-primary"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium">{folder.name}</span>
                        {isSubfolder && folder.parentId && (
                          <div className="text-sm text-muted-foreground">
                            Parent: {parentFolders.find(f => f.id === folder.parentId)?.name}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(folder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
