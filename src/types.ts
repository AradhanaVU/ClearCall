export interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  isScamWarning: boolean;
  scamKeywords: string[];
}

export interface ScamKeyword {
  keyword: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
}

export interface Theme {
  name: string;
  backgroundColor: string;
  textColor: string;
  captionBackground: string;
  captionText: string;
  warningColor: string;
  buttonColor: string;
  buttonText: string;
}

export interface CallLogEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  transcript: TranscriptEntry[];
  totalScamWarnings: number;
  callerId: string;
  isScamCall: boolean;
  callType?: 'call' | 'recording';
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  isScamRisk: boolean;
  scamRiskLevel: 'low' | 'medium' | 'high';
  scamReasons: string[];
  lastCallDate?: Date;
  totalCalls: number;
  scamWarnings: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactSearchFilters {
  query: string;
  scamRiskOnly: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  sortBy: 'name' | 'lastCall' | 'scamWarnings' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export type Page = 'home' | 'joinCall' | 'contacts' | 'callHistory' | 'settings' | 'help' | 'callTranscript';

export interface NavigationItem {
  id: Page;
  label: string;
  icon: string;
  description: string;
}