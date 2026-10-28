import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { getAllLessons } from '../../data/topicsData';
import { LessonItem } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const allLessons = getAllLessons();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? allLessons.filter(lesson => {
        const q = query.toLowerCase();
        return (
          lesson.title.toLowerCase().includes(q) ||
          lesson.category.toLowerCase().includes(q) ||
          lesson.description.toLowerCase().includes(q) ||
          lesson.tags.some(t => t.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelect = (lesson: LessonItem) => {
    navigate(lesson.path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-surface w-full max-w-xl rounded-2xl shadow-elevated border border-app-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-app-border bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Banker's algorithm, CPU scheduling, paging, mnemonics..."
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-text-main placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-text-main rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-text-muted">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Type keywords like <span className="text-primary-blue font-semibold">"Banker"</span>, <span className="text-primary-blue font-semibold">"Gantt"</span>, <span className="text-primary-blue font-semibold">"LRU"</span>, or <span className="text-primary-blue font-semibold">"MEHN"</span></p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              <p>No matching lessons found for "{query}".</p>
              <p className="text-[11px] text-slate-400 mt-1">Try searching for broader terms like "scheduling", "deadlock", or "memory".</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => handleSelect(lesson)}
                  className="w-full text-left p-3 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5 max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-text-main group-hover:text-primary-blue">
                        {lesson.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                        {lesson.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">{lesson.description}</p>
                    <div className="flex items-center space-x-1.5 pt-1">
                      {lesson.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] text-slate-400 bg-white border border-slate-200 px-1 rounded font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-blue group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-app-border text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{allLessons.length} modules indexed</span>
          </span>
          <span className="font-mono text-[10px]">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
