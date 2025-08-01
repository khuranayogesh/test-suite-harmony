import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataManager } from '@/utils/dataManager';
import { Script, Folder, Screenshot } from '@/types';
import { Plus, X, Upload, Save, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ScriptEditProps {
  script: Script;
  onSave: () => void;
}

export function ScriptEdit({ script, onSave }: ScriptEditProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState(script.folderId);
  const [selectedSubfolder, setSelectedSubfolder] = useState(script.subfolderId || '');
  const [assumptions, setAssumptions] = useState<string[]>(script.assumptions.length > 0 ? script.assumptions : ['']);
  const [screenshots, setScreenshots] = useState<Screenshot[]>(script.screenshots);
  const [formData, setFormData] = useState({
    scriptId: script.scriptId,
    shortDescription: script.shortDescription,
    testEnvironment: script.testEnvironment,
    testType: script.testType,
    purpose: script.purpose,
    expectedResults: script.expectedResults,
    scriptDetails: script.scriptDetails,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadSubfolders(selectedFolder);
    } else {
      setSubfolders([]);
      setSelectedSubfolder('');
    }
  }, [selectedFolder]);

  const loadFolders = () => {
    const data = DataManager.loadData();
    setFolders(data.folders.filter(f => !f.isSubfolder));
  };

  const loadSubfolders = (parentId: string) => {
    const data = DataManager.loadData();
    setSubfolders(data.folders.filter(f => f.isSubfolder && f.parentId === parentId));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssumptionChange = (index: number, value: string) => {
    const newAssumptions = [...assumptions];
    newAssumptions[index] = value;
    setAssumptions(newAssumptions);
  };

  const addAssumption = () => {
    setAssumptions([...assumptions, '']);
  };

  const removeAssumption = (index: number) => {
    if (assumptions.length > 1) {
      setAssumptions(assumptions.filter((_, i) => i !== index));
    }
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setScreenshots(prev => [...prev, screenshot]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateScreenshotDescription = (id: string, description: string) => {
    setScreenshots(prev => 
      prev.map(s => s.id === id ? { ...s, description } : s)
    );
  };

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.scriptId || !formData.shortDescription || !selectedFolder) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const filteredAssumptions = assumptions.filter(a => a.trim() !== '');
    
    try {
      DataManager.updateScript(script.id, {
        scriptId: formData.scriptId,
        shortDescription: formData.shortDescription,
        folderId: selectedFolder,
        subfolderId: selectedSubfolder || undefined,
        testEnvironment: formData.testEnvironment,
        testType: formData.testType,
        purpose: formData.purpose,
        assumptions: filteredAssumptions,
        expectedResults: formData.expectedResults,
        scriptDetails: formData.scriptDetails,
        screenshots,
      });

      onSave();
      toast({
        title: "Success",
        description: "Script updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update script",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Folder Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="folder">Folder *</Label>
          <select
            id="folder"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select a folder</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="subfolder">Sub-folder</Label>
          <select
            id="subfolder"
            value={selectedSubfolder}
            onChange={(e) => setSelectedSubfolder(e.target.value)}
            className="form-select"
            disabled={!selectedFolder}
          >
            <option value="">Select a sub-folder (optional)</option>
            {subfolders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Script Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scriptId">Script ID *</Label>
          <Input
            id="scriptId"
            value={formData.scriptId}
            onChange={(e) => handleInputChange('scriptId', e.target.value)}
            placeholder="Enter script ID"
            className="form-input"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="shortDescription">Script Short Description *</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            placeholder="Enter short description"
            className="form-input"
            required
          />
        </div>
      </div>

      {/* Test Environment and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="testEnvironment">Test Environment</Label>
          <select
            id="testEnvironment"
            value={formData.testEnvironment}
            onChange={(e) => handleInputChange('testEnvironment', e.target.value)}
            className="form-select"
          >
            <option value="Online">Online</option>
            <option value="Batch">Batch</option>
            <option value="Online & Batch">Online & Batch</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="testType">Test Type</Label>
          <select
            id="testType"
            value={formData.testType}
            onChange={(e) => handleInputChange('testType', e.target.value)}
            className="form-select"
          >
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Purpose */}
      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => handleInputChange('purpose', e.target.value)}
          placeholder="Enter the purpose of this script"
          className="form-input"
          rows={3}
        />
      </div>

      {/* Assumptions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Assumptions</Label>
          <Button type="button" onClick={addAssumption} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Assumption
          </Button>
        </div>
        <div className="space-y-2">
          {assumptions.map((assumption, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={assumption}
                onChange={(e) => handleAssumptionChange(index, e.target.value)}
                placeholder={`Assumption ${index + 1}`}
                className="form-input"
              />
              {assumptions.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeAssumption(index)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expected Results */}
      <div>
        <Label htmlFor="expectedResults">Expected Results</Label>
        <Textarea
          id="expectedResults"
          value={formData.expectedResults}
          onChange={(e) => handleInputChange('expectedResults', e.target.value)}
          placeholder="Enter expected results"
          className="form-input"
          rows={3}
        />
      </div>

      {/* Script Details */}
      <div>
        <Label htmlFor="scriptDetails">Script Details</Label>
        <Textarea
          id="scriptDetails"
          value={formData.scriptDetails}
          onChange={(e) => handleInputChange('scriptDetails', e.target.value)}
          placeholder="Enter detailed script information, procedures, etc."
          className="form-input"
          rows={6}
        />
      </div>

      {/* Screenshots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Screenshots</Label>
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleScreenshotUpload}
              className="hidden"
              id="screenshot-upload-edit"
            />
            <Button
              type="button"
              onClick={() => document.getElementById('screenshot-upload-edit')?.click()}
              size="sm"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Screenshots
            </Button>
          </div>
        </div>
        
        {screenshots.length > 0 && (
          <div className="space-y-3">
            {screenshots.map(screenshot => (
              <div key={screenshot.id} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{screenshot.fileName}</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{screenshot.fileName}</DialogTitle>
                        </DialogHeader>
                        <img 
                          src={screenshot.path} 
                          alt={screenshot.description || screenshot.fileName}
                          className="w-full h-auto rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      onClick={() => removeScreenshot(screenshot.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  value={screenshot.description}
                  onChange={(e) => updateScreenshotDescription(screenshot.id, e.target.value)}
                  placeholder="Enter screenshot description"
                  className="form-input"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Update Script
        </Button>
      </div>
    </form>
  );
}