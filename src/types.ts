export interface AudioRecord {
  id: string;
  fileName: string;
  audioUrl?: string;
  audioBase64?: string;
  laoTranscript: string;
  englishTranscript: string;
  summary: string;
  speakersCount: number;
  tone: string;
  callQuality: string;
  keywords: string[];
  status: "verified" | "flagged" | "review";
  createdAt: string;
  duration: number; // in seconds
  isFallback?: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

export interface MeetingRecord {
  id: string;
  topic: string;
  laoTranscript: string;
  englishTranscript: string;
  summary: string;
  createdAt: string;
  duration: number; // in seconds
  audioBase64?: string;
  isFallback?: boolean;
}

export type SidebarTab = "dashboard" | "records" | "verify" | "meeting" | "settings";
