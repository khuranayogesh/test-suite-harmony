import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataManager } from '@/utils/dataManager';
import { Script, Folder } from '@/types';
import { Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import { ScriptView } from './ScriptView';
import { ScriptEdit } from './ScriptEdit';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export function ScriptsListing() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedSubfolder, setSelectedSubfolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingScript, setViewingScript] = useState<Script | null>(null);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [scripts, selectedFolder, selectedSubfolder, searchTerm]);

  const loadData = () => {
    const data = DataManager.loadData();
    setScripts(data.scripts);
    setFolders(data.folders);
  };

  const filterScripts = () => {
    let filtered = scripts;

    if (selectedFolder) {
      filtered = filtered.filter(s => s.folderId === selectedFolder);
      if (selectedSubfolder) {
        filtered = filtered.filter(s => s.subfolderId === selectedSubfolder);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.scriptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredScripts(filtered);
  };

  const handleDeleteScript = (id: string) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      try {
        DataManager.deleteScript(id);
        loadData();
        toast({
          title: "Success",
          description: "Script deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete script",
          variant: "destructive",
        });
      }
    }
  };

  const getFolderName = (folderId: string) => {
    return folders.find(f => f.id === folderId)?.name || 'Unknown';
  };

  const getSubfolders = () => {
    return folders.filter(f => f.isSubfolder && f.parentId === selectedFolder);
  };

  const mainFolders = folders.filter(f => !f.isSubfolder);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID or description"
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Folder</label>
              <select
                value={selectedFolder}
                onChange={(e) => {
                  setSelectedFolder(e.target.value);
                  setSelectedSubfolder('');
                }}
                className="form-select"
              >
                <option value="">All Folders</option>
                {mainFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sub-folder</label>
              <select
                value={selectedSubfolder}
                onChange={(e) => setSelectedSubfolder(e.target.value)}
                className="form-select"
                disabled={!selectedFolder}
              >
                <option value="">All Sub-folders</option>
                {getSubfolders().map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedFolder('');
                  setSelectedSubfolder('');
                  setSearchTerm('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Scripts ({filteredScripts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredScripts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scripts found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScripts.map(script => (
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
                      </div>
                      <p className="font-medium mb-1">{script.shortDescription}</p>
                      <p className="text-sm text-muted-foreground">
                        Folder: {getFolderName(script.folderId)}
                        {script.subfolderId && ` > ${getFolderName(script.subfolderId)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(script.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setViewingScript(script)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>View Script: {script.scriptId}</DialogTitle>
                          </DialogHeader>
                          {viewingScript && <ScriptView script={viewingScript} />}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setEditingScript(script)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Script: {script.scriptId}</DialogTitle>
                          </DialogHeader>
                          {editingScript && (
                            <ScriptEdit 
                              script={editingScript} 
                              onSave={() => {
                                loadData();
                                setEditingScript(null);
                              }} 
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteScript(script.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}