export interface User {
  username: string;
  password: string;
  userType: 'User' | 'Administrator';
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  isSubfolder?: boolean;
}

export interface Script {
  id: string;
  scriptId: string;
  shortDescription: string;
  folderId: string;
  subfolderId?: string;
  testEnvironment: 'Online' | 'Batch' | 'Online & Batch';
  testType: 'Positive' | 'Negative';
  purpose: string;
  assumptions: string[];
  expectedResults: string;
  scriptDetails: string;
  screenshots: Screenshot[];
  createdAt: string;
  updatedAt: string;
}

export interface Screenshot {
  id: string;
  fileName: string;
  description: string;
  path: string;
  uploadedAt: string;
}

export interface ImportedScript extends Script {
  originalId: string;
  importedAt: string;
  status: 'Pending' | 'Completed' | 'Issue';
  remarks?: string;
  userScreenshots: Screenshot[];
  issues: string[];
  isImported: boolean;
}

export interface Issue {
  id: string;
  issueNumber: number;
  scriptId?: string;
  description: string;
  resolution?: string;
  screenshots: Screenshot[];
  status: 'Open' | 'Fixed' | 'Reopen';
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  folders: Folder[];
  scripts: Script[];
  importedScripts: ImportedScript[];
  issues: Issue[];
  issueCounter: number;
}