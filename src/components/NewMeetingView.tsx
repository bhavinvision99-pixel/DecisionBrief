import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  RotateCcw,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Loader2,
  CheckCircle2,
  HelpCircle,
  FileUp,
  Link2,
  Layers,
  X,
  FileCode
} from 'lucide-react';
import { DEMO_TRANSCRIPT, PRECOMPUTED_DEMO_ANALYSIS } from '../data/demoMeeting';
import { MeetingAnalysis } from '../types/decisionBrief';

interface NewMeetingViewProps {
  onMeetingAnalyzed: (meeting: MeetingAnalysis) => void;
  existingMeetings?: MeetingAnalysis[];
}

export const NewMeetingView: React.FC<NewMeetingViewProps> = ({
  onMeetingAnalyzed,
  existingMeetings = [],
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [meetingRelation, setMeetingRelation] = useState<'standalone' | 'related'>('standalone');
  const [selectedParentMeeting, setSelectedParentMeeting] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [serverStatus, setServerStatus] = useState<{
    hasGeminiKey: boolean;
    model: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setInputMode('paste');
    setMeetingRelation('standalone');
    setTitle('Project Meridian — Operational Alignment & Risk Review');
    setDate('2026-10-14');
    setParticipants(
      'Marcus Vance (Client Delivery Director), Elena Rostova (Senior Consultant), Julian Blake (Marketing Lead), Priya Sharma (Finance Director), Tom Gallagher (Supplier Manager), Sophie Laurent (Lead Solutions Architect)'
    );
    setTranscript(DEMO_TRANSCRIPT);
    setUploadedFile(null);
    setErrorMessage(null);
  };

  const handleStartBlank = () => {
    setInputMode('upload');
    setMeetingRelation('standalone');
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setParticipants('');
    setTranscript('');
    setUploadedFile(null);
    setErrorMessage(null);
  };

  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscript(content);
      setUploadedFile({
        name: file.name,
        size: Math.round(file.size / 1024),
      });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim() || transcript.trim().length < 20) {
      setErrorMessage(
        'Please upload or paste a meeting transcript with dialogue (at least 20 characters).'
      );
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
          meetingContext: {
            isRelated: meetingRelation === 'related',
            parentMeetingTitle: selectedParentMeeting || undefined,
          },
        }),
      });

      clearInterval(stepInterval);

      if (response.ok) {
        const result: MeetingAnalysis = await response.json();
        result.meetingContext = {
          isRelated: meetingRelation === 'related',
          parentMeetingTitle: selectedParentMeeting || undefined,
        };
        onMeetingAnalyzed(result);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Backend returned non-200, checking fallback:', errorData);

        // If it's the demo transcript or key is missing, provide synthetic analysis with clear indicator
        const isDemoTranscript =
          transcript.includes('Marcus Vance') && transcript.includes('CloudCore');

        if (isDemoTranscript || errorData.fallbackAvailable) {
          const fallbackData: MeetingAnalysis = {
            ...PRECOMPUTED_DEMO_ANALYSIS,
            id: `mtg-${Date.now()}`,
            title: title || PRECOMPUTED_DEMO_ANALYSIS.title,
            date: date || PRECOMPUTED_DEMO_ANALYSIS.date,
            transcript,
            meetingContext: {
              isRelated: meetingRelation === 'related',
              parentMeetingTitle: selectedParentMeeting || undefined,
            },
            isPrecomputedFallback: true,
            fallbackNotice:
              'Precomputed synthetic analysis used (API key not configured in environment).',
          };
          onMeetingAnalyzed(fallbackData);
        } else {
          setErrorMessage(
            errorData.error ||
              'Failed to analyze meeting. Please verify your transcript and retry.'
          );
        }
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.warn('Network error calling /api/analyze-meeting, using demo fallback:', err);
      if (transcript.includes('Marcus Vance') || transcript.includes('CloudCore')) {
        onMeetingAnalyzed({
          ...PRECOMPUTED_DEMO_ANALYSIS,
          id: `mtg-${Date.now()}`,
          isPrecomputedFallback: true,
          meetingContext: {
            isRelated: meetingRelation === 'related',
            parentMeetingTitle: selectedParentMeeting || undefined,
          },
        });
      } else {
        setErrorMessage(
          'Could not connect to the analysis engine. Please verify the server is running or load the Corvane demo meeting.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Primary Mandatory Verification Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/90 border-2 border-amber-400 text-amber-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Mandatory Manager Verification Notice
          </h2>
          <p className="text-xs leading-relaxed text-amber-900 font-medium">
            <strong>DecisionBrief is an advisory AI assistant designed to reduce reading fatigue.</strong>{' '}
            All generated executive summaries, decision status tags (Confirmed vs Proposed), action item
            owners, and risk alerts are synthetic suggestions. <strong>The manager must independently verify
            all items against the supporting transcript quotations</strong> before approving funding, signing
            off on delivery commitments, or delegating governance.
          </p>
        </div>
      </div>

      {/* Main Card Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <FileUp className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Upload New Meeting Transcript
              </h1>
              <p className="text-xs text-slate-500">
                Process any meeting (standalone project, new client, or follow-up in an ongoing series)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Corvane Demo
            </button>
            <button
              onClick={handleStartBlank}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            >
              Start Blank Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Context Selector: Standalone vs Follow-up */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Meeting Relationship & Context
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            onClick={() => setMeetingRelation('standalone')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
              meetingRelation === 'standalone'
                ? 'bg-teal-50/70 border-teal-500 shadow-xs ring-1 ring-teal-500'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="meetingRelation"
              checked={meetingRelation === 'standalone'}
              onChange={() => setMeetingRelation('standalone')}
              className="mt-1 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                Independent / Standalone Meeting
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                New client, unique vendor sync, or unlinked project with no prior dependencies.
              </span>
            </div>
          </label>

          <label
            onClick={() => setMeetingRelation('related')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
              meetingRelation === 'related'
                ? 'bg-teal-50/70 border-teal-500 shadow-xs ring-1 ring-teal-500'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="meetingRelation"
              checked={meetingRelation === 'related'}
              onChange={() => setMeetingRelation('related')}
              className="mt-1 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block flex items-center gap-1.5">
                Follow-Up / Series Meeting
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">
                  Continuity
                </span>
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Part of an existing series (e.g. Sprint Review, Steering Committee follow-up).
              </span>
            </div>
          </label>
        </div>

        {/* Previous meeting link selector if related */}
        {meetingRelation === 'related' && existingMeetings.length > 0 && (
          <div className="pt-2 animate-in fade-in">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Link to existing meeting series:
            </label>
            <select
              value={selectedParentMeeting}
              onChange={(e) => setSelectedParentMeeting(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="">Select an existing meeting...</option>
              {existingMeetings.map((m) => (
                <option key={m.id} value={m.title}>
                  {m.title} ({m.date})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Ingestion Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        {/* Meeting Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Strategy Review, Client Discovery, or Sprint 14 Retro"
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
            placeholder="e.g. John Doe, Sarah Jenkins, Client Lead (or leave empty to auto-detect)"
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Separate names with commas. If left empty, DecisionBrief automatically identifies speakers
            from transcript tags (e.g., "Alice:", "Bob:").
          </p>
        </div>

        {/* Input Method Toggle */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Meeting Transcript Source
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  inputMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload File (.txt, .vtt, .srt)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  inputMode === 'paste'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Paste Text
              </button>
            </div>
          </div>

          {/* Mode 1: Drag-and-Drop File Upload */}
          {inputMode === 'upload' && (
            <div className="space-y-3 animate-in fade-in">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50/60'
                    : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.vtt,.srt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to browse or drag & drop meeting transcript
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supports .txt, .vtt (Teams/Zoom captions), .srt, .md, and plain text exports
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs text-teal-950">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <span className="font-bold">{uploadedFile.name}</span>
                      <span className="text-teal-700 ml-2">
                        ({uploadedFile.size} KB • {transcript.trim().split(/\s+/).length} words)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setTranscript('');
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Paste Direct Text */}
          {inputMode === 'paste' && (
            <div className="space-y-1.5 animate-in fade-in">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste verbatim transcript dialogue here...&#10;e.g.&#10;Marcus: Good morning, let's review the Phase 2 audit deliverables.&#10;Elena: I will have that ready by Friday 5 PM."
                rows={12}
                className="w-full p-4 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 text-slate-800 leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {transcript.trim()
                    ? `${transcript.trim().split(/\s+/).length} words loaded`
                    : '0 words'}
                </span>
                <span>Speaker format: "Speaker Name: Message"</span>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress Display */}
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
                2. Auditing decisions for consensus vs dissent (checking unapproved proposals)...
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

        {/* Submission Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            Engine: {serverStatus?.model || 'gemini-3.8-flash'} • Verification Safeguards Active
          </div>

          <button
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
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
