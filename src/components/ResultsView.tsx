import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileSearch,
  UserCheck,
  UserX,
  UserPlus,
  Flame,
  Check,
  Edit2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  MeetingAnalysis,
  DecisionItem,
  ActionItem,
  RiskItem,
  OwnerStatus,
  DeadlineStatus,
  PriorityLevel,
  ActionStatus
} from '../types/decisionBrief';
import { TranscriptViewer } from './TranscriptViewer';

interface ResultsViewProps {
  meeting: MeetingAnalysis;
  safeguardsMode: boolean;
  onUpdateMeeting: (updated: MeetingAnalysis) => void;
  onRequestReviewDecision: (decision: DecisionItem) => void;
  onOpenReflectivePrompt: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  meeting,
  safeguardsMode,
  onUpdateMeeting,
  onRequestReviewDecision,
  onOpenReflectivePrompt,
}) => {
  const [highlightQuote, setHighlightQuote] = useState<string | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionDraft, setEditingActionDraft] = useState<Partial<ActionItem>>({});
  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [newActionDraft, setNewActionDraft] = useState({
    task: '',
    owner: '',
    deadline: '',
    priority: 'MEDIUM' as PriorityLevel,
  });

  // Calculate metrics
  const confirmedDecisions = meeting.decisions.filter((d) => d.status === 'CONFIRMED');
  const itemsNeedingApproval = meeting.decisions.filter(
    (d) => d.status !== 'CONFIRMED' || !d.managerConfirmed
  );
  const actionsCount = meeting.actions.length;
  const risksCount = meeting.risks.length;
  const missingOwnerCount = meeting.actions.filter((a) => a.ownerStatus === 'MISSING').length;

  const handleJumpToEvidence = (quote: string) => {
    setHighlightQuote(quote);
    const element = document.getElementById('meeting-transcript-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Action item handlers
  const handleStartEditAction = (action: ActionItem) => {
    setEditingActionId(action.id);
    setEditingActionDraft({
      task: action.task,
      owner: action.owner,
      deadline: action.deadline,
      priority: action.priority,
      status: action.status,
    });
  };

  const handleSaveEditAction = (actionId: string) => {
    const updatedActions = meeting.actions.map((a) => {
      if (a.id !== actionId) return a;
      const owner = (editingActionDraft.owner ?? a.owner).trim();
      const ownerStatus: OwnerStatus = !owner ? 'MISSING' : 'CONFIRMED';
      return {
        ...a,
        task: editingActionDraft.task ?? a.task,
        owner,
        ownerStatus,
        deadline: editingActionDraft.deadline ?? a.deadline,
        priority: editingActionDraft.priority ?? a.priority,
        status: editingActionDraft.status ?? a.status,
        isManagerConfirmed: true,
        needsClarification: !owner,
      };
    });

    onUpdateMeeting({
      ...meeting,
      actions: updatedActions,
    });
    setEditingActionId(null);
  };

  const handleConfirmAssignment = (actionId: string) => {
    const updatedActions = meeting.actions.map((a) => {
      if (a.id !== actionId) return a;
      return {
        ...a,
        ownerStatus: (a.owner ? 'CONFIRMED' : 'MISSING') as OwnerStatus,
        isManagerConfirmed: true,
        needsClarification: !a.owner,
      };
    });
    onUpdateMeeting({
      ...meeting,
      actions: updatedActions,
    });
  };

  const handleToggleActionStatus = (actionId: string) => {
    const updatedActions = meeting.actions.map((a) => {
      if (a.id !== actionId) return a;
      const newStatus: ActionStatus = a.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return { ...a, status: newStatus };
    });
    onUpdateMeeting({ ...meeting, actions: updatedActions });
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionDraft.task.trim()) return;

    const newAction: ActionItem = {
      id: `act-custom-${Date.now()}`,
      task: newActionDraft.task.trim(),
      owner: newActionDraft.owner.trim(),
      ownerStatus: newActionDraft.owner.trim() ? 'CONFIRMED' : 'MISSING',
      deadline: newActionDraft.deadline.trim(),
      deadlineStatus: newActionDraft.deadline.trim() ? 'CONFIRMED' : 'MISSING',
      priority: newActionDraft.priority,
      status: 'PENDING',
      transcriptQuote: 'Added manually by manager.',
      needsClarification: !newActionDraft.owner.trim(),
      isManagerConfirmed: true,
      evidenceVerified: true,
    };

    onUpdateMeeting({
      ...meeting,
      actions: [...meeting.actions, newAction],
    });

    setNewActionDraft({
      task: '',
      owner: '',
      deadline: '',
      priority: 'MEDIUM',
    });
    setShowAddActionForm(false);
  };

  const handleDeleteAction = (actionId: string) => {
    onUpdateMeeting({
      ...meeting,
      actions: meeting.actions.filter((a) => a.id !== actionId),
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Precomputed / Live Analysis Notice */}
      {meeting.isPrecomputedFallback && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Notice:</strong> This analysis was precomputed from the synthetic Corvane demo dataset (offline mode). It demonstrates identical behavioural safeguards without sending network requests.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-semibold">
            SYNTHETIC DEMO
          </span>
        </div>
      )}

      {/* Behavioural Mode Banner */}
      {!safeguardsMode ? (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                STANDARD AI SUMMARY MODE ACTIVE (Simulated Generic Copilot)
              </p>
              <p className="text-xs text-amber-800 leading-tight">
                Notice how uncertainty is obscured: the £12k marketing increase looks settled, unassigned compliance duties are hidden, and deliberate friction is disabled.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded border border-amber-300 shrink-0">
            High Automation Bias Risk
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-300 text-teal-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-teal-900">
                DECISIONBRIEF SAFEGUARDS ACTIVE
              </p>
              <p className="text-xs text-teal-800 leading-tight">
                Decision friction enforced, evidence quotations verified against transcript, and unassigned actions flagged for manager confirmation.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenReflectivePrompt}
            className="text-xs font-bold text-teal-900 bg-white hover:bg-teal-100 px-3 py-1.5 rounded-md border border-teal-300 shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Audit Blind Spots
          </button>
        </div>
      )}

      {/* Top Section: Your Meeting in 60 Seconds */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Executive Synthesis
              </span>
              <span className="text-xs text-slate-500">
                {meeting.date} • {meeting.participants.length} Participants
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Your meeting in 60 seconds
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              ~{meeting.metrics.timeSavedMinutes} mins saved ({meeting.metrics.wordCount} words distilled)
            </span>
          </div>
        </div>

        {/* Executive Summary (<100 words, direct British English) */}
        <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-l-teal-600 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Executive Brief (Under 100 Words)
          </p>
          <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
            {meeting.executiveSummary}
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Confirmed decisions */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Confirmed Decisions</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {confirmedDecisions.length}
            </p>
            <p className="text-[11px] text-teal-700 font-medium mt-1">
              Explicit consensus reached
            </p>
          </div>

          {/* Card 2: Actions identified */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Actions Identified</span>
              <Calendar className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{actionsCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {missingOwnerCount > 0 ? (
                <span className="text-rose-600 font-bold">{missingOwnerCount} need owner</span>
              ) : (
                'All owners assigned'
              )}
            </p>
          </div>

          {/* Card 3: Items needing approval */}
          <div className={`p-4 rounded-xl border shadow-2xs transition-colors ${
            itemsNeedingApproval.length > 0
              ? 'bg-amber-50/40 border-amber-300'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>Needing Approval</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-950 mt-2">
              {itemsNeedingApproval.length}
            </p>
            <p className="text-[11px] text-amber-800 font-medium mt-1">
              Proposed or deferred items
            </p>
          </div>

          {/* Card 4: Risks or blockers */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Risks & Blockers</span>
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{risksCount}</p>
            <p className="text-[11px] text-rose-700 font-medium mt-1">
              {meeting.risks.filter(r => r.severity === 'HIGH').length} critical severity
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: Decisions Requiring Attention */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Section 1: Decisions Requiring Attention</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {meeting.decisions.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Proposed or unresolved items enforce deliberate review friction to prevent unexamined approvals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {meeting.decisions.map((decision) => {
            const isConfirmed = decision.status === 'CONFIRMED';
            const isProposed = decision.status === 'PROPOSED';
            const isUnresolved = decision.status === 'UNRESOLVED';

            return (
              <div
                key={decision.id}
                className={`p-5 rounded-xl border transition-all ${
                  isConfirmed
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : isProposed
                    ? 'bg-amber-50/30 border-amber-300 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-300'
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

                      {safeguardsMode && decision.evidenceVerified && (
                        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                          <Check className="w-3 h-3 text-teal-600" />
                          Evidence verified in transcript
                        </span>
                      )}

                      {safeguardsMode && !isConfirmed && (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Manager Approval Required
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {decision.statement}
                    </h3>

                    {decision.uncertaintyExplanation && safeguardsMode && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded border border-slate-200">
                        <strong className="text-slate-800">Uncertainty analysis:</strong>{' '}
                        {decision.uncertaintyExplanation}
                      </p>
                    )}

                    {decision.transcriptQuote && (
                      <div className="text-xs font-mono text-slate-600 bg-slate-100/70 p-2 rounded border border-slate-200 flex items-start gap-1.5">
                        <span className="text-slate-400 font-sans font-bold">Quote:</span>
                        <span className="italic leading-relaxed">
                          "{decision.transcriptQuote}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleJumpToEvidence(decision.transcriptQuote)}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      View Evidence
                    </button>

                    <button
                      onClick={() => onRequestReviewDecision(decision)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shadow-2xs ${
                        isConfirmed
                          ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300'
                          : 'text-white bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Review Decision
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Action Plan */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Section 2: Action Plan</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {meeting.actions.length} items
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Interactive action tracker. Unassigned tasks are explicitly flagged to prevent accountability diffusion.
            </p>
          </div>

          <button
            onClick={() => setShowAddActionForm(!showAddActionForm)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-md transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Action Item
          </button>
        </div>

        {/* Add Action Form */}
        {showAddActionForm && (
          <form
            onSubmit={handleAddAction}
            className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3 animate-in fade-in"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              New Action Item
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Task description..."
                  value={newActionDraft.task}
                  onChange={(e) => setNewActionDraft({ ...newActionDraft, task: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Owner (leave blank if missing)..."
                  value={newActionDraft.owner}
                  onChange={(e) => setNewActionDraft({ ...newActionDraft, owner: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Deadline (e.g. Friday 5 PM)..."
                  value={newActionDraft.deadline}
                  onChange={(e) =>
                    setNewActionDraft({ ...newActionDraft, deadline: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddActionForm(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-teal-700 text-white rounded text-xs font-semibold"
              >
                Save Action
              </button>
            </div>
          </form>
        )}

        {/* Action Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10">Done</th>
                <th className="py-3 px-4 min-w-[260px]">Task</th>
                <th className="py-3 px-4 min-w-[150px]">Owner</th>
                <th className="py-3 px-4 min-w-[130px]">Deadline</th>
                <th className="py-3 px-4 w-24">Priority</th>
                {safeguardsMode && <th className="py-3 px-4 min-w-[140px]">Verification</th>}
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meeting.actions.map((action) => {
                const isEditing = editingActionId === action.id;
                const isMissingOwner = action.ownerStatus === 'MISSING';
                const isSuggestedOwner = action.ownerStatus === 'SUGGESTED';

                return (
                  <tr
                    key={action.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      action.status === 'COMPLETED' ? 'bg-slate-50/50 opacity-60' : ''
                    } ${isMissingOwner ? 'bg-rose-50/30' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4 align-top">
                      <input
                        type="checkbox"
                        checked={action.status === 'COMPLETED'}
                        onChange={() => handleToggleActionStatus(action.id)}
                        className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                      />
                    </td>

                    {/* Task */}
                    <td className="py-3 px-4 align-top">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingActionDraft.task ?? action.task}
                          onChange={(e) =>
                            setEditingActionDraft({
                              ...editingActionDraft,
                              task: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <div>
                          <p
                            className={`font-semibold text-slate-900 leading-snug ${
                              action.status === 'COMPLETED' ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {action.task}
                          </p>
                          {action.clarificationReason && safeguardsMode && (
                            <p className="text-[11px] text-rose-700 font-medium mt-1">
                              ⚠️ {action.clarificationReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4 align-top">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingActionDraft.owner ?? action.owner}
                          onChange={(e) =>
                            setEditingActionDraft({
                              ...editingActionDraft,
                              owner: e.target.value,
                            })
                          }
                          placeholder="Assign owner..."
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <div className="space-y-1">
                          <span
                            className={`inline-block font-semibold ${
                              action.owner ? 'text-slate-800' : 'text-rose-600 italic'
                            }`}
                          >
                            {action.owner || 'Unassigned'}
                          </span>
                          <div>
                            {action.ownerStatus === 'CONFIRMED' && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                Owner confirmed
                              </span>
                            )}
                            {action.ownerStatus === 'SUGGESTED' && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                Owner suggested
                              </span>
                            )}
                            {action.ownerStatus === 'MISSING' && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Owner missing
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-4 align-top">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingActionDraft.deadline ?? action.deadline}
                          onChange={(e) =>
                            setEditingActionDraft({
                              ...editingActionDraft,
                              deadline: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <div>
                          <span className="text-slate-800 font-medium">
                            {action.deadline || 'No deadline'}
                          </span>
                          {action.deadlineStatus === 'AMBIGUOUS' && safeguardsMode && (
                            <span className="block text-[10px] text-amber-700 font-semibold">
                              (Ambiguous deadline)
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 align-top">
                      {isEditing ? (
                        <select
                          value={editingActionDraft.priority ?? action.priority}
                          onChange={(e) =>
                            setEditingActionDraft({
                              ...editingActionDraft,
                              priority: e.target.value as PriorityLevel,
                            })
                          }
                          className="px-1.5 py-1 border border-slate-300 rounded text-xs"
                        >
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            action.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : action.priority === 'MEDIUM'
                              ? 'bg-slate-100 text-slate-800 border border-slate-200'
                              : 'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {action.priority}
                        </span>
                      )}
                    </td>

                    {/* Verification / Safeguard confirmation */}
                    {safeguardsMode && (
                      <td className="py-3 px-4 align-top">
                        {isMissingOwner ? (
                          <button
                            onClick={() => handleStartEditAction(action)}
                            className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold transition-colors flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            Assign Owner
                          </button>
                        ) : !action.isManagerConfirmed ? (
                          <button
                            onClick={() => handleConfirmAssignment(action.id)}
                            className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Confirm Assignment
                          </button>
                        ) : (
                          <span className="text-[11px] text-teal-800 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                            Audited
                          </span>
                        )}
                      </td>
                    )}

                    {/* Row controls */}
                    <td className="py-3 px-4 align-top text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEditAction(action.id)}
                            className="px-2 py-1 bg-teal-700 text-white rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingActionId(null)}
                            className="px-1.5 py-1 text-slate-500 hover:text-slate-800"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEditAction(action)}
                            title="Edit task, owner or deadline"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAction(action.id)}
                            title="Delete task"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: Risks and Blind Spots */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Section 3: Risks & Blind Spots</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                What might I be missing?
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Separates explicitly stated operational risks from AI-inferred potential risks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meeting.risks.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                risk.severity === 'HIGH'
                  ? 'bg-rose-50/20 border-rose-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {risk.severity} SEVERITY
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      risk.isAiInferred
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {risk.isAiInferred ? 'AI-INFERRED RISK' : 'EXPLICIT IN TRANSCRIPT'}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {risk.riskType}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{risk.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{risk.description}</p>

              {risk.transcriptQuote && (
                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-0.5 font-sans font-semibold text-slate-500">
                    <span>Evidence snippet:</span>
                    <button
                      onClick={() => handleJumpToEvidence(risk.transcriptQuote || '')}
                      className="text-teal-700 hover:underline flex items-center gap-0.5"
                    >
                      Locate <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  "{risk.transcriptQuote}"
                </div>
              )}

              {risk.mitigationSuggestion && (
                <div className="text-xs text-teal-900 bg-teal-50/70 p-2 rounded border border-teal-200 font-medium">
                  💡 Actionable Mitigation: {risk.mitigationSuggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: Meeting Transcript */}
      <section id="meeting-transcript-section" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Section 4: Full Meeting Transcript</span>
            </h2>
            <p className="text-xs text-slate-500">
              Interactive evidence audit viewer with searchable speaker dialogue.
            </p>
          </div>
        </div>

        <TranscriptViewer
          transcript={meeting.transcript}
          highlightSnippet={highlightQuote}
          onClearHighlight={() => setHighlightQuote(null)}
        />
      </section>
    </div>
  );
};
