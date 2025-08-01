import { AppData, Folder, Script, ImportedScript, Issue } from '@/types';

const STORAGE_KEY = 'regressionAssistantData';

const defaultData: AppData = {
  folders: [],
  scripts: [],
  importedScripts: [],
  issues: [],
  issueCounter: 0,
};

export class DataManager {
  private static data: AppData | null = null;

  static loadData(): AppData {
    if (this.data) return this.data;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.data = stored ? JSON.parse(stored) : { ...defaultData };
      return this.data;
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = { ...defaultData };
      return this.data;
    }
  }

  static saveData(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.data = data;
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  static updateData(updates: Partial<AppData>): AppData {
    const currentData = this.loadData();
    const newData = { ...currentData, ...updates };
    this.saveData(newData);
    return newData;
  }

  // Folder operations
  static addFolder(name: string, parentId?: string): Folder {
    const data = this.loadData();
    const folder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      isSubfolder: !!parentId,
    };
    
    data.folders.push(folder);
    this.saveData(data);
    return folder;
  }

  static updateFolder(id: string, name: string): void {
    const data = this.loadData();
    const folderIndex = data.folders.findIndex(f => f.id === id);
    if (folderIndex !== -1) {
      data.folders[folderIndex].name = name;
      this.saveData(data);
    }
  }

  static deleteFolder(id: string): void {
    const data = this.loadData();
    // Remove folder and all its subfolders
    data.folders = data.folders.filter(f => f.id !== id && f.parentId !== id);
    // Remove scripts in this folder
    data.scripts = data.scripts.filter(s => s.folderId !== id && s.subfolderId !== id);
    this.saveData(data);
  }

  // Script operations
  static addScript(script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Script {
    const data = this.loadData();
    const newScript: Script = {
      ...script,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.scripts.push(newScript);
    this.saveData(data);
    return newScript;
  }

  static updateScript(id: string, updates: Partial<Script>): void {
    const data = this.loadData();
    const scriptIndex = data.scripts.findIndex(s => s.id === id);
    if (scriptIndex !== -1) {
      data.scripts[scriptIndex] = {
        ...data.scripts[scriptIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
    }
  }

  static deleteScript(id: string): void {
    const data = this.loadData();
    data.scripts = data.scripts.filter(s => s.id !== id);
    this.saveData(data);
  }

  // Imported script operations
  static importScript(script: Script): ImportedScript {
    const data = this.loadData();
    const importedScript: ImportedScript = {
      ...script,
      id: Date.now().toString(),
      originalId: script.id,
      importedAt: new Date().toISOString(),
      status: 'Pending',
      userScreenshots: [],
      issues: [],
      isImported: true,
    };
    
    data.importedScripts.push(importedScript);
    this.saveData(data);
    return importedScript;
  }

  static updateImportedScript(id: string, updates: Partial<ImportedScript>): void {
    const data = this.loadData();
    const scriptIndex = data.importedScripts.findIndex(s => s.id === id);
    if (scriptIndex !== -1) {
      data.importedScripts[scriptIndex] = {
        ...data.importedScripts[scriptIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
    }
  }

  // Issue operations
  static addIssue(issue: Omit<Issue, 'id' | 'issueNumber' | 'createdAt' | 'updatedAt'>): Issue {
    const data = this.loadData();
    data.issueCounter += 1;
    
    const newIssue: Issue = {
      ...issue,
      id: Date.now().toString(),
      issueNumber: data.issueCounter,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.issues.push(newIssue);
    this.saveData(data);
    return newIssue;
  }

  static updateIssue(id: string, updates: Partial<Issue>): void {
    const data = this.loadData();
    const issueIndex = data.issues.findIndex(i => i.id === id);
    if (issueIndex !== -1) {
      data.issues[issueIndex] = {
        ...data.issues[issueIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
    }
  }

  static linkIssueToScript(issueId: string, scriptId: string): void {
    const data = this.loadData();
    const scriptIndex = data.importedScripts.findIndex(s => s.id === scriptId);
    if (scriptIndex !== -1) {
      if (!data.importedScripts[scriptIndex].issues.includes(issueId)) {
        data.importedScripts[scriptIndex].issues.push(issueId);
        data.importedScripts[scriptIndex].status = 'Issue';
        this.saveData(data);
      }
    }
  }
}