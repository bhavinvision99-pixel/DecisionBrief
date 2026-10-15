import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileSearch,
  UserCheck,
  Search,
  Filter,
  Check,
  ArrowRight
} from 'lucide-react';
import { MeetingAnalysis, DecisionItem, DecisionStatus } from '../types/decisionBrief';

interface DecisionsViewProps {
  meetings: MeetingAnalysis[];
  onRequestReviewDecision: (decision: DecisionItem) => void;
  onJumpToMeetingEvidence: (meeting: MeetingAnalysis, quote: string) => void;
  safeguardsMode: boolean;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({
  meetings,
  onRequestReviewDecision,
  onJumpToMeetingEvidence,
  safeguardsMode,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | DecisionStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten decisions with meeting metadata
  const items = meetings.flatMap((m) =>
    m.decisions.map((d) => ({
      ...d,
      meetingTitle: m.title,
      meetingDate: m.date,
      parentMeeting: m,
    }))
  );

  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      item.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transcriptQuote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.peopleInvolved.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const confirmedCount = items.filter((i) => i.status === 'CONFIRMED').length;
  const proposedCount = items.filter((i) => i.status === 'PROPOSED').length;
  const unresolvedCount = items.filter((i) => i.status === 'UNRESOLVED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <Scale className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Decisions Governance & Verification Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audited register of meeting conclusions. Deliberate review friction ensures proposed items are
            not mistaken for ratified executive consensus.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('PROPOSED')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'PROPOSED'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            Proposed ({proposedCount})
          </button>
          <button
            onClick={() => setStatusFilter('UNRESOLVED')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'UNRESOLVED'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unresolved ({unresolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1 rounded-md transition-all ${
              statusFilter === 'CONFIRMED'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-teal-800 hover:text-teal-950'
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter decisions by topic, participant name, or transcript quote..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
        />
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {filteredItems.map((decision) => {
          const isConfirmed = decision.status === 'CONFIRMED';
          const isProposed = decision.status === 'PROPOSED';
          const isUnresolved = decision.status === 'UNRESOLVED';

          return (
            <div
              key={decision.id}
              className={`p-5 rounded-xl border bg-white shadow-xs transition-all space-y-3 ${
                isProposed
                  ? 'border-amber-300 bg-amber-50/20'
                  : isUnresolved
                  ? 'border-slate-300 bg-slate-50/40'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                        isConfirmed
                          ? 'bg-teal-50 text-teal-800 border-teal-300'
                          : isProposed
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      {decision.status}
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                      {decision.meetingTitle} • {decision.meetingDate}
                    </span>

                    {safeguardsMode && decision.evidenceVerified && (
                      <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-teal-600" />
                        Evidence verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {decision.statement}
                  </h3>

                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Participants:</span>
                    <span>{decision.peopleInvolved.join(', ') || 'Consensus reached'}</span>
                  </div>

                  {decision.uncertaintyExplanation && safeguardsMode && (
                    <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Uncertainty analysis:</strong>{' '}
                      {decision.uncertaintyExplanation}
                    </div>
                  )}

                  {decision.transcriptQuote && (
                    <div className="p-2.5 rounded bg-slate-100/70 border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed">
                      <span className="font-sans font-semibold text-slate-500 mr-1.5">Quote:</span>
                      "{decision.transcriptQuote}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() =>
                      onJumpToMeetingEvidence(decision.parentMeeting, decision.transcriptQuote)
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    View Evidence
                  </button>

                  <button
                    onClick={() => onRequestReviewDecision(decision)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Review Decision
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 italic">
            No decisions match the current filter or search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
