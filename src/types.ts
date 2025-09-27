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
  transcript: TranscriptEntry[];
  totalScamWarnings: number;
}
