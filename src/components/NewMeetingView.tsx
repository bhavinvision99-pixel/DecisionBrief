import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  Loader2
} from 'lucide-react';
import { DEMO_TRANSCRIPT, PRECOMPUTED_DEMO_ANALYSIS } from '../data/demoMeeting';
import { MeetingAnalysis } from '../types/decisionBrief';

interface NewMeetingViewProps {
  onMeetingAnalyzed: (meeting: MeetingAnalysis) => void;
}

export const NewMeetingView: React.FC<NewMeetingViewProps> = ({ onMeetingAnalyzed }) => {
  const [title, setTitle] = useState('Project Meridian — Operational Alignment & Risk Review');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState(
    'Marcus Vance (Client Delivery Director), Elena Rostova (Senior Consultant), Julian Blake (Marketing Lead), Priya Sharma (Finance Director), Tom Gallagher (Supplier Manager), Sophie Laurent (Lead Solutions Architect)'
  );
  const [transcript, setTranscript] = useState(DEMO_TRANSCRIPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [serverStatus, setServerStatus] = useState<{
    hasGeminiKey: boolean;
    model: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check server status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          hasGeminiKey: data.hasGeminiKey,
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch((err) => {
        console.warn('Could not contact /api/status, will use fallback capability', err);
        setServerStatus({ hasGeminiKey: false, model: 'gemini-3.8-flash' });
      });
  }, []);

  const handleLoadDemo = () => {
    setTitle('Project Meridian — Operational Alignment & Risk Review');
    setDate('2026-10-14');
    setParticipants(
      'Marcus Vance (Client Delivery Director), Elena Rostova (Senior Consultant), Julian Blake (Marketing Lead), Priya Sharma (Finance Director), Tom Gallagher (Supplier Manager), Sophie Laurent (Lead Solutions Architect)'
    );
    setTranscript(DEMO_TRANSCRIPT);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setParticipants('');
    setTranscript('');
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscript(content);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setErrorMessage('Please provide a meeting transcript to analyse.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    const participantList = participants
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/analyze-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Untitled Meeting',
          date,
          participants: participantList,
          transcript,
        }),
      });

      clearInterval(stepInterval);

      if (response.ok) {
        const result: MeetingAnalysis = await response.json();
        onMeetingAnalyzed(result);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Backend returned non-200, checking fallback:', errorData);

        // If it's the demo transcript or key is missing, provide the realistic synthetic analysis with clear indicator
        const isDemoTranscript =
          transcript.includes('Marcus Vance') && transcript.includes('CloudCore');

        if (isDemoTranscript || errorData.fallbackAvailable) {
          // Precomputed synthetic analysis
          const fallbackData: MeetingAnalysis = {
            ...PRECOMPUTED_DEMO_ANALYSIS,
            id: `mtg-demo-${Date.now()}`,
            title: title || PRECOMPUTED_DEMO_ANALYSIS.title,
            date: date || PRECOMPUTED_DEMO_ANALYSIS.date,
            transcript,
            isPrecomputedFallback: true,
            fallbackNotice:
              'Precomputed synthetic analysis used (API key not configured in environment).',
          };
          onMeetingAnalyzed(fallbackData);
        } else {
          setErrorMessage(
            errorData.error || 'Failed to analyze meeting. Please verify your transcript and retry.'
          );
        }
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.warn('Network error calling /api/analyze-meeting, using demo fallback:', err);
      if (transcript.includes('Marcus Vance') || transcript.includes('CloudCore')) {
        onMeetingAnalyzed({
          ...PRECOMPUTED_DEMO_ANALYSIS,
          id: `mtg-demo-${Date.now()}`,
          isPrecomputedFallback: true,
        });
      } else {
        setErrorMessage(
          'Could not connect to the analysis engine. Please try again or load the Corvane demo meeting.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Ingest & Analyse Meeting Transcript
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Demo Meeting (Corvane Group)
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              Clear Form
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Paste any meeting transcript (Teams, Zoom, Google Meet, or Webex) or click{' '}
          <strong className="text-slate-700">Load Demo Meeting</strong> to test DecisionBrief with a
          realistic 20-minute project meeting containing budget disagreements, unassigned tasks, and
          supplier delays.
        </p>
      </div>

      {/* Engine Status Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              serverStatus?.hasGeminiKey ? 'bg-teal-500 ring-2 ring-teal-200' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold text-slate-800">
            AI Engine: {serverStatus?.model || 'gemini-3.8-flash'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">
            {serverStatus?.hasGeminiKey
              ? 'Live Gemini API connected'
              : 'Ready with Corvane Synthetic Demo dataset'}
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
          JSON Schema Enforced
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Meridian — Operational Alignment & Risk Review"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Participants (Optional)
          </label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="e.g. Marcus Vance, Elena Rostova, Julian Blake, Priya Sharma, Tom Gallagher, Sophie Laurent"
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Separate names with commas. DecisionBrief will extract speaker roles from transcript dialogue.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Meeting Transcript
            </label>
            <label className="cursor-pointer text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt file</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here (e.g. 'Marcus Vance: Right, thanks everyone for joining...')"
            rows={14}
            className="w-full p-4 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 text-slate-800 leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>
              {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words` : '0 words'}
            </span>
            <span>Recommended format: "Speaker Name: Utterance..."</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI Analysis & Behavioural Audit in Progress
              </span>
              <span className="text-xs font-mono text-slate-400">Step {analysisStep} of 4</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p
                className={`transition-colors ${
                  analysisStep >= 1 ? 'text-teal-300 font-semibold' : 'text-slate-500'
                }`}
              >
                1. Parsing transcript speakers & extracting project timeline...
              </p>
              <p
                className={`transition-colors ${
                  analysisStep >= 2 ? 'text-teal-300 font-semibold' : 'text-slate-500'
                }`}
              >
                2. Auditing decisions for consensus vs dissent (checking £12k marketing request)...
              </p>
              <p
                className={`transition-colors ${
                  analysisStep >= 3 ? 'text-teal-300 font-semibold' : 'text-slate-500'
                }`}
              >
                3. Verifying transcript quotations & flagging unassigned action items...
              </p>
              <p
                className={`transition-colors ${
                  analysisStep >= 4 ? 'text-teal-300 font-semibold' : 'text-slate-500'
                }`}
              >
                4. Compiling executive 60-second synthesis and behavioural safeguards...
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md flex items-center gap-2 ${
              isAnalyzing
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 active:scale-98'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analysing Meeting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyse Meeting</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
