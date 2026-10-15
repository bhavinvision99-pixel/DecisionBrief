import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  X,
  UserX,
  Clock,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Flame,
  FileQuestion
} from 'lucide-react';
import { MeetingAnalysis } from '../types/decisionBrief';

interface ReflectivePromptModalProps {
  meeting: MeetingAnalysis | null;
  onClose: () => void;
  onJumpToEvidence: (quote: string) => void;
  onNavigateTab: (tab: 'decisions' | 'actions' | 'results') => void;
}

export const ReflectivePromptModal: React.FC<ReflectivePromptModalProps> = ({
  meeting,
  onClose,
  onJumpToEvidence,
  onNavigateTab,
}) => {
  if (!meeting) return null;

  // Filter out the blind spots
  const unassignedActions = meeting.actions.filter((a) => a.ownerStatus === 'MISSING');
  const ambiguousDeadlines = meeting.actions.filter((a) => a.deadlineStatus === 'AMBIGUOUS');
  const unconfirmedDecisions = meeting.decisions.filter((d) => d.status !== 'CONFIRMED');
  const disagreements = meeting.risks.filter((r) => r.riskType === 'DISAGREEMENT');
  const criticalRisks = meeting.risks.filter((r) => r.severity === 'HIGH');
  const openQuestions = meeting.openQuestions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                What Might I Be Missing?
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-900 text-teal-200 border border-teal-700">
                  Manager Blind-Spot Audit
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cognitive debiasing review: highlights implicit friction, missing owners, and unexamined assumptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* 1. Unassigned Responsibilities (Accountability Diffusion) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-600" />
                1. Accountability Vacuum: Tasks Without an Owner ({unassignedActions.length})
              </h3>
              <button
                onClick={() => {
                  onNavigateTab('actions');
                  onClose();
                }}
                className="text-xs text-rose-700 hover:underline font-semibold flex items-center gap-1"
              >
                Go to Action Tracker <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {unassignedActions.length > 0 ? (
              <div className="space-y-2">
                {unassignedActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-rose-900">{action.task}</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">
                          OWNER MISSING
                        </span>
                      </div>
                      <p className="text-rose-800 leading-relaxed">
                        {action.clarificationReason || 'Discussed in meeting, but nobody accepted responsibility.'}
                      </p>
                      {action.transcriptQuote && (
                        <p className="mt-1.5 text-[11px] font-mono text-slate-600 bg-white/70 p-1.5 rounded border border-rose-100">
                          "{action.transcriptQuote}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg">
                No unassigned action items detected.
              </p>
            )}
          </section>

          {/* 2. Unconfirmed Decisions & Ambiguity */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                2. Disputed or Deferred Decisions ({unconfirmedDecisions.length})
              </h3>
              <button
                onClick={() => {
                  onNavigateTab('decisions');
                  onClose();
                }}
                className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1"
              >
                Go to Decisions <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {unconfirmedDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">{dec.statement}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      {dec.status}
                    </span>
                  </div>
                  <p className="text-amber-900 leading-relaxed">{dec.uncertaintyExplanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Operational Disagreements & High-Severity Risks */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-teal-600" />
              3. Operational Disagreements & Regulatory Blind Spots
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {criticalRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{risk.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        risk.isAiInferred
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {risk.isAiInferred ? 'AI INFERRED' : 'EXPLICIT IN TRANSCRIPT'}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{risk.description}</p>
                  {risk.mitigationSuggestion && (
                    <div className="pt-1 text-[11px] text-teal-800 font-medium">
                      💡 Suggested Mitigation: {risk.mitigationSuggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 4. Open Questions Before Steering Committee */}
          {openQuestions.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-teal-600" />
                4. Critical Unanswered Questions Before Steering Committee
              </h3>
              <div className="space-y-2">
                {openQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg bg-teal-50/50 border border-teal-200 text-xs flex items-start gap-2.5"
                  >
                    <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{q.question}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        <span className="font-semibold text-teal-900">Why it matters:</span> {q.whyItMatters}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            DecisionBrief Safeguard: Designed to counteract managerial decision fatigue
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md transition-colors shadow-2xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
