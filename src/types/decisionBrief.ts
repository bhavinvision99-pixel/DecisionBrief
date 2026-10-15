export type DecisionStatus = 'CONFIRMED' | 'PROPOSED' | 'UNRESOLVED';

export interface DecisionItem {
  id: string;
  statement: string;
  status: DecisionStatus;
  peopleInvolved: string[];
  transcriptQuote: string;
  uncertaintyExplanation?: string;
  managerApprovalRequired: boolean;
  managerReviewed?: boolean;
  managerConfirmed?: boolean;
  reviewNotes?: string;
  evidenceVerified?: boolean;
}

export type OwnerStatus = 'CONFIRMED' | 'SUGGESTED' | 'MISSING';
export type DeadlineStatus = 'CONFIRMED' | 'AMBIGUOUS' | 'MISSING';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  ownerStatus: OwnerStatus;
  deadline: string;
  deadlineStatus: DeadlineStatus;
  priority: PriorityLevel;
  status: ActionStatus;
  transcriptQuote: string;
  needsClarification: boolean;
  clarificationReason?: string;
  isManagerConfirmed: boolean;
  evidenceVerified?: boolean;
}

export type RiskType =
  | 'OPERATIONAL'
  | 'DISAGREEMENT'
  | 'MISSING_INFO'
  | 'DELAY'
  | 'DEPENDENCY'
  | 'EVIDENCE_GAP';

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  riskType: RiskType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  isAiInferred: boolean; // explicitly separates stated risks from inferred potential risks
  transcriptQuote?: string;
  mitigationSuggestion?: string;
  isResolved?: boolean;
  evidenceVerified?: boolean;
}

export interface OpenQuestion {
  id: string;
  question: string;
  askedBy?: string;
  addressedTo?: string;
  whyItMatters: string;
  answered?: boolean;
}

export interface MeetingAnalysis {
  id: string;
  title: string;
  date: string;
  participants: string[];
  transcript: string;
  executiveSummary: string;
  decisions: DecisionItem[];
  actions: ActionItem[];
  risks: RiskItem[];
  openQuestions: OpenQuestion[];
  analyzedAt: string;
  isPrecomputedFallback?: boolean;
  fallbackNotice?: string;
  metrics: {
    wordCount: number;
    readingTimeOriginalMinutes: number;
    readingTimeSummaryMinutes: number;
    timeSavedMinutes: number;
  };
}

export interface ConfidenceSurvey {
  meetingId: string;
  rating: number; // 1 to 5
  timestamp: string;
  feedback?: string;
}
