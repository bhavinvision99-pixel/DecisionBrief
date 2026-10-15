import React from 'react';
import {
  Grid,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  User,
  Clock,
  Briefcase,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  safeguardsMode: boolean;
  onToggleSafeguards: (enabled: boolean) => void;
  onOpenReflectivePrompt: () => void;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  safeguardsMode,
  onToggleSafeguards,
  onOpenReflectivePrompt,
  onNavigateTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Microsoft 365 Style Ribbon Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Left: M365 App launcher & Tenant Info */}
        <div className="flex items-center gap-3">
          <button
            title="Microsoft 365 App Launcher"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Grid className="w-5 h-5" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-teal-600 text-white font-bold text-sm shadow-xs">
              DB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  DecisionBrief
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  Corvane Group M365
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-tight">
                Less meeting admin. Better decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Behavioural Mode Selector (Safeguards vs Standard) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 max-w-xs sm:max-w-md">
          <button
            onClick={() => onToggleSafeguards(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              safeguardsMode
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="DecisionBrief Behavioural Safeguards: uncertainty warnings, evidence checks, ownership audits"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DecisionBrief</span> Safeguards
          </button>
          <button
            onClick={() => onToggleSafeguards(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              !safeguardsMode
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Standard AI Summary: Uncritical summariser without friction or evidence verification"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Standard AI</span>
          </button>
        </div>

        {/* Right: Upload Transcript Button, Reflective Prompt Trigger & Manager Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigateTab('new-meeting')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-98"
            title="Upload a new meeting transcript (standalone or series follow-up)"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span className="hidden sm:inline">Upload Transcript</span>
            <span className="sm:hidden">Upload</span>
          </button>

          <button
            onClick={onOpenReflectivePrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-900 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-98"
            title="Cognitive check: identify hidden risks, ambiguous deadlines, and missing owners"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="hidden md:inline">What might I be missing?</span>
            <span className="md:hidden">Missing?</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden lg:block" />

          {/* Verification Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold"
            title="Governance Notice: AI outputs require human verification prior to action"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Manager Audit Required</span>
          </div>

          {/* Overloaded Manager Profile Pill */}
          <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs">
                SJ
              </div>
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                title="Cognitive Load: High (32 hours in meetings this week)"
              />
            </div>
            <div className="hidden xl:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  Sarah Jenkins
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-[10px] text-amber-700 font-medium">
                Overloaded Manager (32h mtgs)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
