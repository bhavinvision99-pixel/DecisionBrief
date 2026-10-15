import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSearch,
  Lock,
  ArrowRight,
  ShieldAlert,
  Info,
  X,
  Clock,
  UserCheck
} from 'lucide-react';
import { DecisionItem } from '../types/decisionBrief';

interface DecisionFrictionModalProps {
  decision: DecisionItem | null;
  onClose: () => void;
  onConfirmDecision: (decisionId: string, confirmed: boolean, notes: string) => void;
  onJumpToEvidence: (quote: string) => void;
}

export const DecisionFrictionModal: React.FC<DecisionFrictionModalProps> = ({
  decision,
  onClose,
  onConfirmDecision,
  onJumpToEvidence,
}) => {
  if (!decision) return null;

  const [hasReviewedEvidence, setHasReviewedEvidence] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [overrideIntent, setOverrideIntent] = useState<'none' | 'approve' | 'reject'>('none');

  const isProposedOrUnresolved = decision.status !== 'CONFIRMED';

  const handleApprove = () => {
    if (!hasReviewedEvidence && isProposedOrUnresolved) return;
    onConfirmDecision(
      decision.id,
      true,
      managerNotes.trim() || 'Manager formally reviewed transcript evidence and confirmed approval.'
    );
    onClose();
  };

  const handleReject = () => {
    onConfirmDecision(
      decision.id,
      false,
      managerNotes.trim() || 'Manager confirmed this item was not approved during the meeting.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${
              decision.status === 'CONFIRMED'
                ? 'bg-teal-500/20 text-teal-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {decision.status === 'CONFIRMED' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Behavioural Verification: Review Decision
              </h3>
              <p className="text-[11px] text-slate-400">
                Deliberate friction safeguard to prevent premature approval
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {/* Decision Statement Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
                Decision Statement
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  decision.status === 'CONFIRMED'
                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                    : decision.status === 'PROPOSED'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                {decision.status}
              </span>
            </div>
            <p className="text-base font-semibold text-slate-900 leading-snug">
              {decision.statement}
            </p>
            <div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
              <span className="font-semibold text-slate-700">Participants:</span>
              <span>{decision.peopleInvolved.join(', ') || 'General agreement'}</span>
            </div>
          </div>

          {/* Uncertainty / Behavioural Alert */}
          {isProposedOrUnresolved ? (
            <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-300 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>APPROVAL FRICTION TRIGGER: Item Was NOT Formally Approved</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900">
                {decision.uncertaintyExplanation ||
                  'This decision was discussed or proposed, but was not ratified with executive consensus. Generic AI tools frequently misclassify proposed topics as final decisions.'}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-900 leading-relaxed">
                {decision.uncertaintyExplanation || 'Explicit consensus recorded in meeting transcript.'}
              </p>
            </div>
          )}

          {/* Verbatim Transcript Evidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-teal-600" />
                Transcript Quotation & Verbatim Context
              </span>
              <button
                onClick={() => {
                  onJumpToEvidence(decision.transcriptQuote);
                  onClose();
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
              >
                Jump to transcript passage <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800 leading-relaxed max-h-36 overflow-y-auto">
              "{decision.transcriptQuote || 'No exact quote available in transcript.'}"
            </div>
          </div>

          {/* Friction Checkbox for Proposed/Unresolved */}
          {isProposedOrUnresolved && (
            <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-300 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasReviewedEvidence}
                  onChange={(e) => setHasReviewedEvidence(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  I have read the verbatim transcript evidence and acknowledge that consensus was
                  disputed or deferred during the meeting.
                </span>
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Manager Rationale / Next Steps (Optional):
                </label>
                <input
                  type="text"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="e.g. Discussed with Priya; pending Julian's Thursday ROI deck"
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {isProposedOrUnresolved ? (
              <>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Confirm as Unapproved / Rejected
                </button>

                <button
                  disabled={!hasReviewedEvidence}
                  onClick={handleApprove}
                  className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    hasReviewedEvidence
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={!hasReviewedEvidence ? 'Check the review confirmation above to unlock override' : ''}
                >
                  {!hasReviewedEvidence && <Lock className="w-3.5 h-3.5" />}
                  Approve (Override Deferral)
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onConfirmDecision(decision.id, true, 'Confirmed explicitly.');
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Keep Confirmed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
