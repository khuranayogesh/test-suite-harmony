import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataManager } from '@/utils/dataManager';
import { Script, Folder, ImportedScript } from '@/types';
import { Download, Search, Filter, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ImportScripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [importedScripts, setImportedScripts] = useState<ImportedScript[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedSubfolder, setSelectedSubfolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    setImportedScripts(data.importedScripts);
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

  const isScriptImported = (scriptId: string) => {
    return importedScripts.some(is => is.originalId === scriptId);
  };

  const handleImportScript = (script: Script) => {
    try {
      DataManager.importScript(script);
      loadData();
      toast({
        title: "Success",
        description: `Script "${script.scriptId}" imported successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import script",
        variant: "destructive",
      });
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
          <CardTitle>Available Scripts ({filteredScripts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredScripts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scripts found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScripts.map(script => {
                const imported = isScriptImported(script.id);
                return (
                  <div key={script.id} className={`p-4 rounded-lg ${imported ? 'bg-success/10 border border-success/20' : 'bg-secondary'}`}>
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
                          {imported && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success text-xs rounded">
                              <CheckCircle className="h-3 w-3" />
                              Imported
                            </span>
                          )}
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
                      
                      <div>
                        {imported ? (
                          <span className="text-success font-medium">Already Imported</span>
                        ) : (
                          <Button
                            onClick={() => handleImportScript(script)}
                            className="btn-primary"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}