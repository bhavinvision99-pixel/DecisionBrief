import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Filter, ArrowUp, Copy, Check, FileText } from 'lucide-react';

interface TranscriptViewerProps {
  transcript: string;
  highlightSnippet: string | null;
  onClearHighlight?: () => void;
}

interface TranscriptLine {
  speaker: string;
  text: string;
  raw: string;
  id: number;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  highlightSnippet,
  onClearHighlight,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Parse lines into speaker and utterance
  const lines: TranscriptLine[] = React.useMemo(() => {
    return transcript
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((raw, idx) => {
        const colonIndex = raw.indexOf(':');
        if (colonIndex > 0 && colonIndex < 35) {
          const speaker = raw.substring(0, colonIndex).trim();
          const text = raw.substring(colonIndex + 1).trim();
          return { speaker, text, raw, id: idx };
        }
        return { speaker: 'Speaker', text: raw, raw, id: idx };
      });
  }, [transcript]);

  // Unique speakers
  const speakers = React.useMemo(() => {
    const set = new Set<string>();
    lines.forEach((l) => {
      if (l.speaker && l.speaker !== 'Speaker') set.add(l.speaker);
    });
    return Array.from(set);
  }, [lines]);

  // Scroll to highlighted snippet when it changes
  useEffect(() => {
    if (highlightSnippet && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightSnippet]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSpeakerColor = (speaker: string) => {
    const s = speaker.toLowerCase();
    if (s.includes('marcus')) return 'bg-blue-100 text-blue-900 border-blue-200';
    if (s.includes('elena')) return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    if (s.includes('julian')) return 'bg-amber-100 text-amber-900 border-amber-200';
    if (s.includes('priya')) return 'bg-purple-100 text-purple-900 border-purple-200';
    if (s.includes('tom')) return 'bg-rose-100 text-rose-900 border-rose-200';
    if (s.includes('sophie')) return 'bg-teal-100 text-teal-900 border-teal-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const filteredLines = lines.filter((line) => {
    const matchesSpeaker = selectedSpeaker === 'ALL' || line.speaker === selectedSpeaker;
    const matchesSearch =
      !searchTerm ||
      line.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  // Check if a line contains the highlight snippet
  const isHighlighted = (line: TranscriptLine) => {
    if (!highlightSnippet) return false;
    const cleanSnippet = highlightSnippet
      .replace(/^[^:]+:\s*/, '')
      .trim()
      .toLowerCase();
    return cleanSnippet.length > 8 && line.raw.toLowerCase().includes(cleanSnippet.slice(0, 30));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Transcript Header / Filter Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Meeting Transcript Viewer
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            ({filteredLines.length} utterances)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transcript..."
              className="pl-8 pr-3 py-1 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white w-40 sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Speaker Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2 py-1 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 font-medium"
            >
              <option value="ALL">All Participants ({speakers.length})</option>
              {speakers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors border border-slate-300"
            title="Copy full transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Active Snippet Notification */}
      {highlightSnippet && (
        <div className="bg-teal-50/90 border-b border-teal-200 px-4 py-2 flex items-center justify-between text-xs text-teal-900 animate-in fade-in">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold shrink-0">Inspecting Evidence:</span>
            <span className="font-mono truncate">"{highlightSnippet.slice(0, 100)}..."</span>
          </div>
          {onClearHighlight && (
            <button
              onClick={onClearHighlight}
              className="text-teal-700 hover:text-teal-900 font-semibold text-xs shrink-0 ml-2"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Transcript Body */}
      <div
        ref={containerRef}
        className="p-4 max-h-[460px] overflow-y-auto space-y-3 font-sans text-xs sm:text-sm divide-y divide-slate-100"
      >
        {filteredLines.length === 0 ? (
          <div className="py-8 text-center text-slate-400 italic">
            No transcript passages matched your search or speaker filter.
          </div>
        ) : (
          filteredLines.map((line) => {
            const highlighted = isHighlighted(line);
            return (
              <div
                key={line.id}
                ref={highlighted ? highlightedRef : undefined}
                className={`pt-3 first:pt-0 transition-all rounded-lg p-2.5 ${
                  highlighted
                    ? 'highlight-evidence bg-teal-50/90 border-2 border-teal-500 shadow-md ring-2 ring-teal-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getSpeakerColor(
                        line.speaker
                      )}`}
                    >
                      {line.speaker}
                    </span>
                  </div>
                  {highlighted && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-200 px-2 py-0.5 rounded">
                      Linked Evidence Match
                    </span>
                  )}
                </div>
                <p className="text-slate-800 leading-relaxed pl-1">{line.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
