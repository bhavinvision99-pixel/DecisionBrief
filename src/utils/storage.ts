import { MeetingAnalysis, ConfidenceSurvey } from '../types/decisionBrief';
import { PRECOMPUTED_DEMO_ANALYSIS } from '../data/demoMeeting';

const STORAGE_KEY_MEETINGS = 'decisionbrief_meetings_v1';
const STORAGE_KEY_ACTIVE_ID = 'decisionbrief_active_id_v1';
const STORAGE_KEY_MODE = 'decisionbrief_safeguard_mode_v1';
const STORAGE_KEY_SURVEYS = 'decisionbrief_surveys_v1';

export function getStoredMeetings(): MeetingAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEETINGS);
    if (!raw) {
      // Seed with demo meeting
      const initial = [PRECOMPUTED_DEMO_ANALYSIS];
      localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read meetings from localStorage', e);
    return [PRECOMPUTED_DEMO_ANALYSIS];
  }
}

export function saveMeetings(meetings: MeetingAnalysis[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
  } catch (e) {
    console.error('Failed to save meetings to localStorage', e);
  }
}

export function saveSingleMeeting(meeting: MeetingAnalysis): void {
  const current = getStoredMeetings();
  const existingIndex = current.findIndex((m) => m.id === meeting.id);
  let updated: MeetingAnalysis[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = meeting;
  } else {
    updated = [meeting, ...current];
  }
  saveMeetings(updated);
}

export function getActiveMeetingId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || PRECOMPUTED_DEMO_ANALYSIS.id;
  } catch {
    return PRECOMPUTED_DEMO_ANALYSIS.id;
  }
}

export function setActiveMeetingId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function getSafeguardMode(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODE);
    return raw === null ? true : raw === 'true'; // Defaults to true (safeguards enabled)
  } catch {
    return true;
  }
}

export function setSafeguardMode(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODE, String(enabled));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredSurveys(): ConfidenceSurvey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SURVEYS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConfidenceSurvey(survey: ConfidenceSurvey): void {
  try {
    const surveys = getStoredSurveys();
    const updated = [survey, ...surveys];
    localStorage.setItem(STORAGE_KEY_SURVEYS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}
