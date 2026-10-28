import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  Bookmark,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
} from 'lucide-react';
import { HANDWRITTEN_NOTES } from '../../data/notesData';
import { progressService } from '../../services/progressService';
import { speechService } from '../../services/speechService';

export const HandwrittenNotesView: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('banker-notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [quickRevisionOnly, setQuickRevisionOnly] = useState<boolean>(false);

  const userProgress = progressService.getProgress();
  const currentTopic = HANDWRITTEN_NOTES.find(n => n.id === selectedTopicId) || HANDWRITTEN_NOTES[0];
  const isBookmarked = userProgress.bookmarkedNotes.includes(currentTopic.id);

  const handleToggleBookmark = () => {
    progressService.toggleBookmarkNote(currentTopic.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNarrateTopic = () => {
    speechService.speak(
      `Reading study notes for ${currentTopic.title}. ${currentTopic.subtitle}. Key formulas include: ${currentTopic.keyFormulas.join('. ')}`
    );
  };

  const filteredTopics = searchQuery.trim()
    ? HANDWRITTEN_NOTES.filter(
        n =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : HANDWRITTEN_NOTES;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Bar */}
      <div className="bg-surface p-6 rounded-3xl border border-app-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 font-mono">
            <BookOpen className="w-4 h-4" />
            <span>Exam Revision Library</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight font-handwriting">
            Handwritten Engineering Study Notes
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
            Notebook-style revision guides with ruled paper styling, yellow highlighter boxes, dry-run tables, and print-to-PDF formatting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isBookmarked
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-app-border hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Topic'}</span>
          </button>

          <button
            onClick={handleNarrateTopic}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-primary-blue border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Listen</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save as PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Topic List on Left, Notebook Page on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Topic Selector (Left 1 Col) - Hidden in Print */}
        <div className="lg:col-span-1 space-y-3 print:hidden">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-surface border border-app-border rounded-xl text-xs"
            />
          </div>

          {/* List of note topics */}
          <div className="space-y-1.5">
            {filteredTopics.map(topic => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-primary-blue text-primary-blue shadow-xs'
                      : 'bg-surface border-app-border text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-xs block font-handwriting">{topic.title}</span>
                  <span className="text-[10px] text-text-muted mt-0.5 block font-mono">
                    {topic.readTimeMinutes} min read • {topic.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick options */}
          <div className="p-3 bg-surface border border-app-border rounded-2xl space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Display Adjustments
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setTextSize('normal')}
                className={`flex-1 py-1 rounded-lg border text-xs font-semibold ${
                  textSize === 'normal' ? 'bg-slate-100 font-bold' : 'text-slate-500'
                }`}
              >
                Standard Text
              </button>
              <button
                onClick={() => setTextSize('large')}
                className={`flex-1 py-1 rounded-lg border text-xs font-semibold ${
                  textSize === 'large' ? 'bg-slate-100 font-bold' : 'text-slate-500'
                }`}
              >
                Large Text
              </button>
            </div>
          </div>
        </div>

        {/* Notebook Ruled Paper View (Right 3 Cols) */}
        <div className="lg:col-span-3">
          <div
            className={`relative bg-[#FFFDF9] border border-amber-200/80 rounded-3xl p-6 sm:p-10 shadow-card min-h-[700px] overflow-hidden ${
              textSize === 'large' ? 'text-sm' : 'text-xs'
            }`}
            style={{
              backgroundImage: 'repeating-linear-gradient(#FFFDF9 0px, #FFFDF9 27px, #E8EEF5 28px)',
              backgroundAttachment: 'local',
              lineHeight: '28px',
            }}
          >
            {/* Red left notebook margin line */}
            <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-red-300 pointer-events-none opacity-80" />

            {/* Note Content Placed to the Right of Red Margin */}
            <div className="pl-8 space-y-6">
              {/* Note Header */}
              <div className="border-b-2 border-red-200/80 pb-3">
                <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest block">
                  Engineering OS Notes • {currentTopic.lastUpdated}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1A202C] font-handwriting mt-1">
                  {currentTopic.title}
                </h2>
                <p className="text-xs font-handwriting text-slate-600 mt-1">
                  {currentTopic.subtitle}
                </p>
              </div>

              {/* Key Formulas Yellow Highlighter Box */}
              <div className="bg-yellow-100/70 border-l-4 border-yellow-500 p-4 rounded-r-2xl space-y-1">
                <span className="text-[11px] font-bold font-handwriting text-yellow-950 uppercase tracking-wider block">
                  ★ Golden Formulas for University Exams:
                </span>
                <div className="space-y-1 font-mono text-xs text-yellow-950 font-bold">
                  {currentTopic.keyFormulas.map((f, fIdx) => (
                    <div key={fIdx}>• {f}</div>
                  ))}
                </div>
              </div>

              {/* Topic Sections */}
              {currentTopic.sections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h3 className="text-lg font-bold text-blue-900 font-handwriting border-b border-blue-200/60 pb-1">
                    {sec.title}
                  </h3>

                  <p className="text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {sec.content}
                  </p>

                  {sec.formulaBox && (
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl font-mono font-bold text-primary-blue text-center my-2">
                      {sec.formulaBox}
                    </div>
                  )}

                  {sec.highlightNote && (
                    <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 text-xs rounded-r-xl">
                      <strong>Important:</strong> {sec.highlightNote}
                    </div>
                  )}

                  {sec.examTip && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-950 text-xs rounded-r-xl">
                      <strong>Exam Tip:</strong> {sec.examTip}
                    </div>
                  )}
                </div>
              ))}

              {/* Dry-Run Table if present */}
              {currentTopic.dryRunTable && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-lg font-bold text-blue-900 font-handwriting border-b border-blue-200/60 pb-1">
                    Dry-Run Table (Step-by-Step Matrix Iteration)
                  </h3>

                  <div className="overflow-x-auto bg-white/90 rounded-2xl border border-slate-200 p-2">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-mono text-[10px]">
                          {currentTopic.dryRunTable.headers.map((h, idx) => (
                            <th key={idx} className="py-2 px-2 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        {currentTopic.dryRunTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-blue-50/40">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-1.5 px-2 ${cIdx === 0 ? 'font-bold text-primary-blue' : ''}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Viva Quick Revision Section */}
              <div className="space-y-3 pt-4 border-t-2 border-slate-200">
                <h3 className="text-lg font-bold text-purple-900 font-handwriting">
                  Last-Minute Viva Quick Notes:
                </h3>
                <div className="space-y-2">
                  {currentTopic.vivaQuestions.map((v, vIdx) => (
                    <div key={vIdx} className="p-3 bg-white/80 border border-slate-200 rounded-xl space-y-1">
                      <div className="font-bold text-slate-800 text-xs">Q: {v.q}</div>
                      <div className="text-slate-600 text-[11px] leading-relaxed">A: {v.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
