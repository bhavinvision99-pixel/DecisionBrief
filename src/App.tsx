/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getStoredMeetings,
  saveMeetings,
  getActiveMeetingId,
  setActiveMeetingId,
  getSafeguardMode,
  setSafeguardMode
} from './utils/storage';
import { MeetingAnalysis, DecisionItem } from './types/decisionBrief';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewMeetingView } from './components/NewMeetingView';
import { ResultsView } from './components/ResultsView';
import { DecisionsView } from './components/DecisionsView';
import { ActionTrackerView } from './components/ActionTrackerView';
import { InsightsView } from './components/InsightsView';
import { DecisionFrictionModal } from './components/DecisionFrictionModal';
import { ReflectivePromptModal } from './components/ReflectivePromptModal';

export default function App() {
  const [meetings, setMeetings] = useState<MeetingAnalysis[]>([]);
  const [activeMeetingId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [safeguardsMode, setSafeguards] = useState<boolean>(true);

  // Modal states
  const [reviewingDecision, setReviewingDecision] = useState<DecisionItem | null>(null);
  const [showReflectivePrompt, setShowReflectivePrompt] = useState<boolean>(false);
  const [jumpQuote, setJumpQuote] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const stored = getStoredMeetings();
    setMeetings(stored);
    const storedActiveId = getActiveMeetingId();
    if (stored.some((m) => m.id === storedActiveId)) {
      setActiveId(storedActiveId);
    } else if (stored.length > 0) {
      setActiveId(stored[0].id);
    }
    setSafeguards(getSafeguardMode());
  }, []);

  const activeMeeting = meetings.find((m) => m.id === activeMeetingId) || meetings[0] || null;

  const handleToggleSafeguards = (enabled: boolean) => {
    setSafeguards(enabled);
    setSafeguardMode(enabled);
  };

  const handleSelectMeeting = (meeting: MeetingAnalysis) => {
    setActiveId(meeting.id);
    setActiveMeetingId(meeting.id);
  };

  const handleMeetingAnalyzed = (meeting: MeetingAnalysis) => {
    const updated = [meeting, ...meetings.filter((m) => m.id !== meeting.id)];
    setMeetings(updated);
    saveMeetings(updated);
    setActiveId(meeting.id);
    setActiveMeetingId(meeting.id);
    setActiveTab('results');
  };

  const handleUpdateMeeting = (updatedMeeting: MeetingAnalysis) => {
    const updated = meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m));
    setMeetings(updated);
    saveMeetings(updated);
  };

  const handleConfirmDecision = (decisionId: string, confirmed: boolean, notes: string) => {
    if (!activeMeeting) return;
    const updatedDecisions = activeMeeting.decisions.map((d) => {
      if (d.id !== decisionId) return d;
      return {
        ...d,
        status: confirmed ? 'CONFIRMED' : ('PROPOSED' as any),
        managerConfirmed: confirmed,
        managerReviewed: true,
        reviewNotes: notes,
      };
    });

    handleUpdateMeeting({
      ...activeMeeting,
      decisions: updatedDecisions,
    });
  };

  const handleJumpToEvidence = (quote: string) => {
    setJumpQuote(quote);
    setActiveTab('results');
    setTimeout(() => {
      const el = document.getElementById('meeting-transcript-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleJumpToMeetingEvidence = (targetMeeting: MeetingAnalysis, quote: string) => {
    handleSelectMeeting(targetMeeting);
    handleJumpToEvidence(quote);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header */}
      <Header
        safeguardsMode={safeguardsMode}
        onToggleSafeguards={handleToggleSafeguards}
        onOpenReflectivePrompt={() => setShowReflectivePrompt(true)}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          meetings={meetings}
          activeMeeting={activeMeeting}
          onSelectMeeting={handleSelectMeeting}
          safeguardsMode={safeguardsMode}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100">
          {activeTab === 'dashboard' && (
            <DashboardView
              meetings={meetings}
              activeMeeting={activeMeeting}
              onSelectMeeting={handleSelectMeeting}
              onNavigateTab={setActiveTab}
              onRequestReviewDecision={(decision) => setReviewingDecision(decision)}
              onOpenReflectivePrompt={() => setShowReflectivePrompt(true)}
              safeguardsMode={safeguardsMode}
            />
          )}

          {activeTab === 'new-meeting' && (
            <NewMeetingView onMeetingAnalyzed={handleMeetingAnalyzed} />
          )}

          {activeTab === 'results' && activeMeeting && (
            <ResultsView
              meeting={activeMeeting}
              safeguardsMode={safeguardsMode}
              onUpdateMeeting={handleUpdateMeeting}
              onRequestReviewDecision={(decision) => setReviewingDecision(decision)}
              onOpenReflectivePrompt={() => setShowReflectivePrompt(true)}
            />
          )}

          {activeTab === 'decisions' && (
            <DecisionsView
              meetings={meetings}
              onRequestReviewDecision={(decision) => setReviewingDecision(decision)}
              onJumpToMeetingEvidence={handleJumpToMeetingEvidence}
              safeguardsMode={safeguardsMode}
            />
          )}

          {activeTab === 'actions' && (
            <ActionTrackerView
              meetings={meetings}
              onUpdateMeeting={handleUpdateMeeting}
              safeguardsMode={safeguardsMode}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              meetings={meetings}
              activeMeeting={activeMeeting}
              safeguardsMode={safeguardsMode}
              onToggleSafeguards={handleToggleSafeguards}
            />
          )}
        </main>
      </div>

      {/* Decision Review Friction Modal */}
      {reviewingDecision && (
        <DecisionFrictionModal
          decision={reviewingDecision}
          onClose={() => setReviewingDecision(null)}
          onConfirmDecision={handleConfirmDecision}
          onJumpToEvidence={handleJumpToEvidence}
        />
      )}

      {/* Reflective Prompt Modal */}
      {showReflectivePrompt && (
        <ReflectivePromptModal
          meeting={activeMeeting}
          onClose={() => setShowReflectivePrompt(false)}
          onJumpToEvidence={handleJumpToEvidence}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setShowReflectivePrompt(false);
          }}
        />
      )}
    </div>
  );
}
