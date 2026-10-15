import React, { useState } from 'react';
import {
  ListTodo,
  CheckCircle2,
  UserX,
  UserCheck,
  UserPlus,
  Clock,
  Filter,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Download,
  AlertTriangle
} from 'lucide-react';
import {
  MeetingAnalysis,
  ActionItem,
  OwnerStatus,
  DeadlineStatus,
  PriorityLevel,
  ActionStatus
} from '../types/decisionBrief';

interface ActionTrackerViewProps {
  meetings: MeetingAnalysis[];
  onUpdateMeeting: (updated: MeetingAnalysis) => void;
  safeguardsMode: boolean;
}

export const ActionTrackerView: React.FC<ActionTrackerViewProps> = ({
  meetings,
  onUpdateMeeting,
  safeguardsMode,
}) => {
  const [filterMode, setFilterMode] = useState<
    'ALL' | 'MISSING_OWNER' | 'SUGGESTED_OWNER' | 'COMPLETED' | 'PENDING'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ActionItem>>({});

  // Flatten actions across meetings
  const allActionsWithMeeting = meetings.flatMap((m) =>
    m.actions.map((a) => ({
      ...a,
      meetingTitle: m.title,
      parentMeeting: m,
    }))
  );

  const missingOwnerCount = allActionsWithMeeting.filter((a) => a.ownerStatus === 'MISSING').length;
  const suggestedOwnerCount = allActionsWithMeeting.filter(
    (a) => a.ownerStatus === 'SUGGESTED'
  ).length;

  const filtered = allActionsWithMeeting.filter((a) => {
    let matchesMode = true;
    if (filterMode === 'MISSING_OWNER') matchesMode = a.ownerStatus === 'MISSING';
    else if (filterMode === 'SUGGESTED_OWNER') matchesMode = a.ownerStatus === 'SUGGESTED';
    else if (filterMode === 'COMPLETED') matchesMode = a.status === 'COMPLETED';
    else if (filterMode === 'PENDING') matchesMode = a.status !== 'COMPLETED';

    const matchesSearch =
      !searchQuery ||
      a.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMode && matchesSearch;
  });

  const handleStartEdit = (action: ActionItem) => {
    setEditingId(action.id);
    setEditDraft({
      task: action.task,
      owner: action.owner,
      deadline: action.deadline,
      priority: action.priority,
      status: action.status,
    });
  };

  const handleSaveEdit = (actionId: string, parentMeeting: MeetingAnalysis) => {
    const updated = parentMeeting.actions.map((a) => {
      if (a.id !== actionId) return a;
      const owner = (editDraft.owner ?? a.owner).trim();
      return {
        ...a,
        task: editDraft.task ?? a.task,
        owner,
        ownerStatus: (owner ? 'CONFIRMED' : 'MISSING') as OwnerStatus,
        deadline: editDraft.deadline ?? a.deadline,
        priority: editDraft.priority ?? a.priority,
        status: editDraft.status ?? a.status,
        isManagerConfirmed: true,
        needsClarification: !owner,
      };
    });

    onUpdateMeeting({ ...parentMeeting, actions: updated });
    setEditingId(null);
  };

  const handleToggleDone = (actionId: string, parentMeeting: MeetingAnalysis) => {
    const updated = parentMeeting.actions.map((a) => {
      if (a.id !== actionId) return a;
      const nextStatus: ActionStatus = a.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      return { ...a, status: nextStatus };
    });
    onUpdateMeeting({ ...parentMeeting, actions: updated });
  };

  const handleConfirmAssignment = (actionId: string, parentMeeting: MeetingAnalysis) => {
    const updated = parentMeeting.actions.map((a) => {
      if (a.id !== actionId) return a;
      return {
        ...a,
        ownerStatus: (a.owner ? 'CONFIRMED' : 'MISSING') as OwnerStatus,
        isManagerConfirmed: true,
        needsClarification: !a.owner,
      };
    });
    onUpdateMeeting({ ...parentMeeting, actions: updated });
  };

  const handleExportCSV = () => {
    const headers = ['Task', 'Owner', 'Owner Status', 'Deadline', 'Priority', 'Status', 'Meeting'];
    const rows = allActionsWithMeeting.map((a) => [
      `"${a.task.replace(/"/g, '""')}"`,
      `"${a.owner}"`,
      `"${a.ownerStatus}"`,
      `"${a.deadline}"`,
      `"${a.priority}"`,
      `"${a.status}"`,
      `"${a.meetingTitle}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DecisionBrief_Actions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <ListTodo className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Action Plan & Accountability Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ensures every extracted deliverable has an explicit owner and verified deadline. Managers
            must confirm suggested owners to prevent accountability diffusion.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Mandatory Manager Verification Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-900">Accountability Verification Rule:</strong> DecisionBrief identifies suggested or missing owners. Tasks must not be delegated to team members automatically without explicit manager review and confirmation of scope and deadlines.
          </p>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold text-[10px] shrink-0">
          Accountability Enforced
        </span>
      </div>

      {/* Missing Owner Callout */}
      {missingOwnerCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-4 text-xs text-rose-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-900 text-sm">
                Accountability Vacuum: {missingOwnerCount} Action Item{missingOwnerCount > 1 ? 's' : ''} Lack an Assigned Owner
              </p>
              <p className="text-rose-800">
                Tasks discussed in meetings but left unassigned create delivery blind spots. Assign an owner below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterMode('MISSING_OWNER')}
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md font-bold text-xs shrink-0 transition-colors"
          >
            Filter Missing ({missingOwnerCount})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({allActionsWithMeeting.length})
          </button>
          <button
            onClick={() => setFilterMode('MISSING_OWNER')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'MISSING_OWNER'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Missing Owner ({missingOwnerCount})
          </button>
          <button
            onClick={() => setFilterMode('SUGGESTED_OWNER')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'SUGGESTED_OWNER'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Suggested ({suggestedOwnerCount})
          </button>
          <button
            onClick={() => setFilterMode('PENDING')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'PENDING'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterMode('COMPLETED')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filterMode === 'COMPLETED'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, owners, meetings..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-10">Done</th>
              <th className="py-3 px-4 min-w-[280px]">Task & Meeting Source</th>
              <th className="py-3 px-4 min-w-[160px]">Owner Status</th>
              <th className="py-3 px-4 min-w-[130px]">Deadline</th>
              <th className="py-3 px-4 w-24">Priority</th>
              <th className="py-3 px-4 min-w-[140px]">Accountability Audit</th>
              <th className="py-3 px-4 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((action) => {
              const isEditing = editingId === action.id;
              const isMissingOwner = action.ownerStatus === 'MISSING';

              return (
                <tr
                  key={action.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    action.status === 'COMPLETED' ? 'bg-slate-50/50 opacity-60' : ''
                  } ${isMissingOwner ? 'bg-rose-50/20' : ''}`}
                >
                  <td className="py-3.5 px-4 align-top">
                    <input
                      type="checkbox"
                      checked={action.status === 'COMPLETED'}
                      onChange={() => handleToggleDone(action.id, action.parentMeeting)}
                      className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                    />
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDraft.task ?? action.task}
                        onChange={(e) => setEditDraft({ ...editDraft, task: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    ) : (
                      <div>
                        <p
                          className={`font-bold text-slate-900 leading-snug ${
                            action.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {action.task}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Source: {action.meetingTitle}
                        </p>
                        {action.clarificationReason && safeguardsMode && (
                          <p className="text-[11px] text-rose-700 font-medium mt-1">
                            ⚠️ {action.clarificationReason}
                          </p>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDraft.owner ?? action.owner}
                        onChange={(e) => setEditDraft({ ...editDraft, owner: e.target.value })}
                        placeholder="Assign owner..."
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
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

                  <td className="py-3.5 px-4 align-top">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDraft.deadline ?? action.deadline}
                        onChange={(e) => setEditDraft({ ...editDraft, deadline: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    ) : (
                      <div>
                        <span className="text-slate-800 font-medium">
                          {action.deadline || 'No deadline'}
                        </span>
                        {action.deadlineStatus === 'AMBIGUOUS' && safeguardsMode && (
                          <span className="block text-[10px] text-amber-700 font-semibold">
                            (Ambiguous)
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    {isEditing ? (
                      <select
                        value={editDraft.priority ?? action.priority}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, priority: e.target.value as PriorityLevel })
                        }
                        className="p-1 border border-slate-300 rounded text-xs"
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

                  <td className="py-3.5 px-4 align-top">
                    {isMissingOwner ? (
                      <button
                        onClick={() => handleStartEdit(action)}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Assign Owner
                      </button>
                    ) : !action.isManagerConfirmed ? (
                      <button
                        onClick={() =>
                          handleConfirmAssignment(action.id, action.parentMeeting)
                        }
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Confirm Assignment
                      </button>
                    ) : (
                      <span className="text-[11px] text-teal-800 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        Confirmed
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 align-top text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSaveEdit(action.id, action.parentMeeting)}
                          className="px-2 py-1 bg-teal-700 text-white rounded text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-1.5 py-1 text-slate-500 hover:text-slate-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(action)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                  No action items match your current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
