import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ListTodo,
  Flame,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  UserX,
  Sparkles,
  Building2
} from 'lucide-react';
import { MeetingAnalysis, DecisionItem } from '../types/decisionBrief';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  meetings: MeetingAnalysis[];
  activeMeeting: MeetingAnalysis | null;
  onSelectMeeting: (meeting: MeetingAnalysis) => void;
  onNavigateTab: (tab: NavTab) => void;
  onRequestReviewDecision: (decision: DecisionItem) => void;
  onOpenReflectivePrompt: () => void;
  safeguardsMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  meetings,
  activeMeeting,
  onSelectMeeting,
  onNavigateTab,
  onRequestReviewDecision,
  onOpenReflectivePrompt,
  safeguardsMode,
}) => {
  // Aggregate stats across all meetings
  const totalMeetings = meetings.length;

  const allDecisions = meetings.flatMap((m) => m.decisions);
  const pendingDecisions = allDecisions.filter(
    (d) => d.status !== 'CONFIRMED' || !d.managerConfirmed
  );

  const allActions = meetings.flatMap((m) => m.actions);
  const unassignedActions = allActions.filter((a) => a.ownerStatus === 'MISSING');
  const outstandingActions = allActions.filter((a) => a.status !== 'COMPLETED');

  const allRisks = meetings.flatMap((m) => m.risks);
  const highRisks = allRisks.filter((r) => r.severity === 'HIGH' && !r.isResolved);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Executive Welcome & Cognitive Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Corvane Group • Executive Overview
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Overloaded Manager Station
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Good morning, Sarah. Here is your decision posture.
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            You have attended over 30 hours of meetings this week. DecisionBrief protects your judgment
            by surfacing unverified proposals, missing action owners, and evidence gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('new-meeting')}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            title="Upload a new transcript (standalone or related to an ongoing series)"
          >
            <PlusCircle className="w-4 h-4" />
            Upload New Transcript
          </button>
          <button
            onClick={onOpenReflectivePrompt}
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            Reflective Check
          </button>
        </div>
      </div>

      {/* Mandatory Manager Verification Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-900">Managerial Oversight Notice:</strong> All AI-generated briefs, decision classifications, and action item assignments are advisory. The manager is required to verify all extracted claims against the linked transcript evidence prior to executive sign-off.
          </p>
        </div>
        <span className="hidden md:inline-block px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold text-[10px] shrink-0">
          Governance Required
        </span>
      </div>

      {/* 4 Core Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Meetings Analysed */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Meetings Analysed</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">{totalMeetings}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Stored in local session memory
          </p>
        </div>

        {/* Metric 2: Decisions Requiring Review */}
        <div
          onClick={() => onNavigateTab('decisions')}
          className={`p-5 rounded-xl border shadow-2xs hover:border-amber-400 transition-all cursor-pointer ${
            pendingDecisions.length > 0 ? 'bg-amber-50/40 border-amber-300' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span>Decisions Requiring Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-950 mt-3">
            {pendingDecisions.length}
          </p>
          <p className="text-[11px] text-amber-800 font-medium mt-1 flex items-center justify-between">
            <span>Proposed or disputed items</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        {/* Metric 3: Outstanding Actions */}
        <div
          onClick={() => onNavigateTab('actions')}
          className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Outstanding Actions</span>
            <ListTodo className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">{outstandingActions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            {unassignedActions.length > 0 ? (
              <span className="text-rose-600 font-bold">{unassignedActions.length} unassigned</span>
            ) : (
              <span>All tasks assigned</span>
            )}
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>

        {/* Metric 4: Unresolved Risks */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Unresolved Risks</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3">{highRisks.length}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">
            Supplier delays & data residency
          </p>
        </div>
      </div>

      {/* Critical Behavioural Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert 1: Decisions Awaiting Attention (e.g. £12k marketing) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Decisions Requiring Manager Oversight
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('decisions')}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
            >
              View all ({pendingDecisions.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Items discussed or requested, but not explicitly approved. Deliberate friction prevents automation bias.
          </p>

          <div className="space-y-3">
            {pendingDecisions.slice(0, 3).map((decision) => (
              <div
                key={decision.id}
                className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      {decision.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {decision.peopleInvolved.join(', ')}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 leading-snug">{decision.statement}</p>
                </div>

                <button
                  onClick={() => onRequestReviewDecision(decision)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shrink-0 shadow-2xs"
                >
                  Review Decision
                </button>
              </div>
            ))}

            {pendingDecisions.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                All meeting decisions have been reviewed.
              </p>
            )}
          </div>
        </div>

        {/* Alert 2: Unassigned Actions (Accountability Diffusion) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                <UserX className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Accountability Vacuum: Missing Owners
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('actions')}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
            >
              Action Tracker ({unassignedActions.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            High-urgency tasks mentioned in transcripts that nobody volunteered to own.
          </p>

          <div className="space-y-3">
            {unassignedActions.slice(0, 3).map((action) => (
              <div
                key={action.id}
                className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950">{action.task}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                    NO OWNER
                  </span>
                </div>
                <p className="text-rose-900 leading-tight">
                  {action.clarificationReason || 'Raised in meeting; declined by attendees.'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Deadline: {action.deadline || 'Immediate'}</span>
                  <button
                    onClick={() => onNavigateTab('actions')}
                    className="text-rose-700 hover:text-rose-900 font-bold hover:underline"
                  >
                    Assign Owner Now →
                  </button>
                </div>
              </div>
            ))}

            {unassignedActions.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                All identified tasks currently have an assigned owner.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Meetings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Meeting Analyses</h3>
            <p className="text-xs text-slate-500">
              Select any meeting to inspect its 60-second synthesis, decisions, and evidence.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('new-meeting')}
            className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
          >
            + New Analysis
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 min-w-[240px]">Meeting Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Decisions</th>
                <th className="py-3 px-4">Actions</th>
                <th className="py-3 px-4">Risks</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{meeting.title}</span>
                      {meeting.isPrecomputedFallback && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {meeting.participants.length} attendees • {meeting.metrics.wordCount} words
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{meeting.date}</td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {meeting.decisions.length}
                    </span>{' '}
                    ({meeting.decisions.filter((d) => d.status === 'CONFIRMED').length} confirmed)
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="font-semibold text-slate-900">{meeting.actions.length}</span> (
                    {meeting.actions.filter((a) => a.ownerStatus === 'MISSING').length} unassigned)
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="font-semibold text-slate-900">{meeting.risks.length}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectMeeting(meeting);
                        onNavigateTab('results');
                      }}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-xs font-semibold transition-colors"
                    >
                      View Brief →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
