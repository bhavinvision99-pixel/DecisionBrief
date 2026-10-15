import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  HelpCircle,
  Sparkles,
  BarChart3,
  ThumbsUp,
  Brain,
  Scale,
  Users,
  Eye,
  Check
} from 'lucide-react';
import { MeetingAnalysis } from '../types/decisionBrief';
import { getStoredSurveys, saveConfidenceSurvey } from '../utils/storage';

interface InsightsViewProps {
  meetings: MeetingAnalysis[];
  activeMeeting: MeetingAnalysis | null;
  safeguardsMode: boolean;
  onToggleSafeguards: (enabled: boolean) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  meetings,
  activeMeeting,
  safeguardsMode,
  onToggleSafeguards,
}) => {
  const [selectedConfidence, setSelectedConfidence] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [labComparisonTab, setLabComparisonTab] = useState<'safeguards' | 'standard'>('safeguards');

  // Aggregated metrics
  const totalMeetings = meetings.length;
  const allActions = meetings.flatMap((m) => m.actions);
  const confirmedOwnerActions = allActions.filter((a) => a.ownerStatus === 'CONFIRMED');
  const confirmedOwnerPct =
    allActions.length > 0
      ? Math.round((confirmedOwnerActions.length / allActions.length) * 100)
      : 100;

  const allDecisions = meetings.flatMap((m) => m.decisions);
  const pendingDecisions = allDecisions.filter(
    (d) => d.status !== 'CONFIRMED' || !d.managerConfirmed
  );

  const allRisks = meetings.flatMap((m) => m.risks);
  const unresolvedRisks = allRisks.filter((r) => !r.isResolved);

  const totalTimeSavedMinutes = meetings.reduce(
    (acc, m) => acc + (m.metrics?.timeSavedMinutes || 3.1),
    0
  );

  const handleConfidenceSubmit = (rating: number) => {
    setSelectedConfidence(rating);
    saveConfidenceSurvey({
      meetingId: activeMeeting?.id || 'demo-001',
      rating,
      timestamp: new Date().toISOString(),
    });
    setFeedbackSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              <FlaskConical className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Behavioural AI Lab & Executive Insights
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Empirical demonstration for the Behavioural AI Workshop at Corvane Group. Explores how
            evidence friction and progressive disclosure mitigate automation bias in overloaded managers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Mode:
          </span>
          <button
            onClick={() => onToggleSafeguards(!safeguardsMode)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border flex items-center gap-1.5 shadow-2xs ${
              safeguardsMode
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-amber-600 text-white border-amber-700'
            }`}
          >
            {safeguardsMode ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {safeguardsMode ? 'DecisionBrief Safeguards' : 'Standard AI Mode'}
          </button>
        </div>
      </div>

      {/* Primary Hypotheses Banner */}
      <div className="p-5 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          Primary Behavioural Science Hypothesis
        </div>
        <blockquote className="text-sm sm:text-base font-medium text-slate-100 italic leading-relaxed border-l-2 border-teal-500 pl-3">
          "Providing evidence-linked meeting summaries with targeted verification prompts will reduce
          unsupported managerial approvals compared with conventional AI-generated summaries."
        </blockquote>
        <p className="text-[11px] text-slate-400 pt-1">
          *Note: This is a testable behavioural hypothesis for the lab workshop, not a pre-established outcome.
        </p>
      </div>

      {/* Section 10: Measurement Metrics Dashboard */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Managerial Efficiency & Governance Metrics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry tracked across all processed meeting briefs.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Meetings Processed */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Meetings Processed</span>
              <BarChart3 className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalMeetings}</p>
            <p className="text-[11px] text-slate-500 mt-1">Transcripts audited</p>
          </div>

          {/* Card 2: Actions with Confirmed Owners */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Confirmed Owners</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-teal-700 mt-2">
              {confirmedOwnerPct}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {confirmedOwnerActions.length} of {allActions.length} tasks confirmed
            </p>
          </div>

          {/* Card 3: Decisions Awaiting Review */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Decisions Awaiting Review</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-700 mt-2">
              {pendingDecisions.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Proposed or unverified</p>
          </div>

          {/* Card 4: Estimated Reading Time Saved */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Est. Reading Time Saved</span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              ~{Math.round(totalTimeSavedMinutes * 10) / 10}m
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Distilled 60-second synthesis
            </p>
          </div>
        </div>

        {/* Clear disclaimer on estimated time savings */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            <strong>Illustrative Metric Disclosure:</strong> Estimated reading time savings are based on
            an assumed standard reading speed of 240 words per minute across raw spoken transcripts
            versus executive 100-word briefs. These figures are illustrative models for workshop demonstration,
            not measured clinical productivity gains.
          </p>
        </div>
      </section>

      {/* Section 9: Interactive Behavioural Audit Demonstration */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Behavioural Lab: Side-by-Side Interface Comparison</span>
              <span className="text-xs bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-mono border border-teal-200">
                A/B Demonstration
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Both sides consume identical transcript data. Compare how generic summarisation fosters
              automation complacency versus DecisionBrief safeguards.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setLabComparisonTab('safeguards')}
              className={`px-3 py-1 rounded-md transition-all ${
                labComparisonTab === 'safeguards'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Safeguards Mode (Recommended)
            </button>
            <button
              onClick={() => setLabComparisonTab('standard')}
              className={`px-3 py-1 rounded-md transition-all ${
                labComparisonTab === 'standard'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard AI Summary
            </button>
          </div>
        </div>

        {/* Tab 1: Safeguards View */}
        {labComparisonTab === 'safeguards' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-300 text-teal-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-teal-900">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>DECISIONBRIEF SAFEGUARDS ARCHITECTURE: Active Friction & Evidence Anchoring</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-teal-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    1. Proposed ≠ Confirmed
                  </span>
                  <p className="text-slate-600">
                    The £12k marketing increase is flagged as <strong>PROPOSED</strong>. Marcus Vance
                    explicitly deferred approval pending Julian's Thursday ROI deck.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-teal-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    2. Accountability Vacuum Flag
                  </span>
                  <p className="text-slate-600">
                    External audit compliance pack is highlighted as <strong>OWNER MISSING</strong>.
                    Requires manager to explicitly assign an owner.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-teal-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    3. Verbatim Evidence Linking
                  </span>
                  <p className="text-slate-600">
                    Every assertion links directly to exact transcript quotes, preventing fabricated
                    hallucinations from entering executive memory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Standard View */}
        {labComparisonTab === 'standard' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 text-amber-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>CONVENTIONAL AI SUMMARY: Naive Synthesis & Automation Bias Vulnerability</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-amber-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    1. Rubber-Stamp Hallucination
                  </span>
                  <p className="text-slate-600">
                    Conventional tools summarize: "Agreed to increase marketing budget for London
                    Tech Summit." An exhausted manager would approve without noticing Priya's dissent!
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-amber-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    2. Masked Accountability
                  </span>
                  <p className="text-slate-600">
                    The compliance audit task is either omitted or listed as "Team will update SLA",
                    leaving no single throat to choke when auditors arrive.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-amber-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    3. Evidence-Free Assertions
                  </span>
                  <p className="text-slate-600">
                    No transcript linking. The manager must accept the model's tone without any easy
                    audit trail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Manager Confidence Pulse Survey */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Decision Confidence & Cognitive Audit Feedback
          </h3>
          <p className="text-xs text-slate-500">
            Workshop survey tool to assess how evidence verification influences managerial confidence.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            How confident are you that you understand the decisions made in this meeting?
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { val: 1, label: '1 - Very Low' },
              { val: 2, label: '2 - Low' },
              { val: 3, label: '3 - Moderate' },
              { val: 4, label: '4 - High' },
              { val: 5, label: '5 - Very High' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => handleConfidenceSubmit(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedConfidence === val
                    ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-teal-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {feedbackSubmitted && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Response logged locally ({selectedConfidence}/5).</p>
                <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
                  Behavioural science note: High self-reported confidence often coexists with
                  significant decision blind spots when unverified AI summaries are used.
                  DecisionBrief friction ensures confidence matches actual evidence backing.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
