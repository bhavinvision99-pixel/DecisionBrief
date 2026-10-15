import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Scale,
  ListTodo,
  FlaskConical,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { MeetingAnalysis } from '../types/decisionBrief';

export type NavTab = 'dashboard' | 'new-meeting' | 'results' | 'decisions' | 'actions' | 'insights';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  meetings: MeetingAnalysis[];
  activeMeeting: MeetingAnalysis | null;
  onSelectMeeting: (meeting: MeetingAnalysis) => void;
  safeguardsMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  meetings,
  activeMeeting,
  onSelectMeeting,
  safeguardsMode,
}) => {
  const pendingDecisionsCount = activeMeeting
    ? activeMeeting.decisions.filter((d) => d.status !== 'CONFIRMED' || !d.managerConfirmed).length
    : 0;

  const missingOwnerActionsCount = activeMeeting
    ? activeMeeting.actions.filter((a) => a.ownerStatus === 'MISSING').length
    : 0;

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Workspace info */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">Corvane Group</p>
            <p className="text-[10px] text-slate-400">6,000 Employees • Professional Services</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('new-meeting')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'new-meeting'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4" />
              <span>New Meeting</span>
            </div>
            <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded font-mono border border-teal-800/50">
              Paste/Demo
            </span>
          </button>

          {activeMeeting && (
            <button
              onClick={() => onSelectTab('results')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'results'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Current Brief</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                60 sec
              </span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('decisions')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'decisions'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4" />
              <span>Decisions</span>
            </div>
            {pendingDecisionsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingDecisionsCount} review
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('actions')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'actions'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ListTodo className="w-4 h-4" />
              <span>Action Tracker</span>
            </div>
            {missingOwnerActionsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {missingOwnerActionsCount} unassigned
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('insights')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Insights & Lab</span>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-700/50">
              Audit
            </span>
          </button>
        </nav>

        {/* Meeting Switcher List */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent Briefs ({meetings.length})
            </span>
          </div>

          <div className="space-y-1">
            {meetings.map((meeting) => {
              const isSelected = activeMeeting?.id === meeting.id;
              return (
                <button
                  key={meeting.id}
                  onClick={() => {
                    onSelectMeeting(meeting);
                    onSelectTab('results');
                  }}
                  className={`w-full text-left p-2 rounded-md transition-all text-xs group flex items-start justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-white border-l-2 border-teal-500'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate pr-1">
                    <p className="font-medium truncate text-[11px] leading-tight">
                      {meeting.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{meeting.date}</p>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${
                      isSelected ? 'text-teal-400' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer: Manager Reality & Behavioural Safeguards status */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Overload Factor
            </span>
            <span className="text-[10px] font-bold text-amber-400">HIGH</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            30+ weekly meeting hours & 200+ emails. Safeguards prevent rubber-stamping unverified items.
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className={`w-3 h-3 ${safeguardsMode ? 'text-teal-400' : 'text-amber-400'}`} />
            {safeguardsMode ? 'Safeguards Active' : 'Standard Mode'}
          </span>
          <span className="text-slate-500">v1.2 Prototype</span>
        </div>
      </div>
    </aside>
  );
};
