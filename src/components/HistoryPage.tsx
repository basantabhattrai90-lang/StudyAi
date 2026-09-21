import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Clock,
  MessageSquare,
  ArrowRight,
  Filter,
  Plus,
  BookOpen
} from 'lucide-react';
import { ChatSessionMeta, Subject, UserAccount } from '../types';

interface HistoryPageProps {
  sessions: ChatSessionMeta[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartNewChat: () => void;
  user: UserAccount | null;
  onOpenAuth: () => void;
}

const FILTER_SUBJECTS: (Subject | 'All')[] = [
  'All',
  'Mathematics',
  'English',
  'Social Studies',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
];

export const HistoryPage: React.FC<HistoryPageProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onStartNewChat,
  user,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSubject =
      selectedSubject === 'All' || session.subject === selectedSubject;
    const matchesSearch =
      !searchQuery.trim() ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Study Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Saved Study Sessions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review your past questions, derivations, and step-by-step solutions.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartNewChat}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </div>

      {/* Guest warning banner if not logged in */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <strong>Guest Mode:</strong> Your sessions are currently stored temporarily. Sign up to permanently sync across your phone, tablet, and computer.
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Sign Up / Log In
          </button>
        </div>
      )}

      {/* Search and Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions or formulas…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {FILTER_SUBJECTS.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedSubject === sub
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* List of Sessions */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/90 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {searchQuery ? 'No matching questions found' : 'No saved sessions yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            {searchQuery
              ? 'Try changing your search keywords or subject filter.'
              : 'Every time you ask a question or upload a worksheet, StudyAI automatically saves your full step-by-step breakdown.'}
          </p>
          <button
            type="button"
            onClick={onStartNewChat}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            Start a Question Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const isCurrent = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                    : 'bg-white hover:border-gray-300 border-gray-200 shadow-2xs'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {session.subject}
                      </span>
                      {session.tone && (
                        <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                          {session.tone} mode
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(session.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2">
                    {session.title}
                  </h3>

                  {/* Preview excerpt */}
                  {session.preview && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      "{session.preview}"
                    </p>
                  )}
                </div>

                {/* Visible Buttons at bottom of card */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {session.messageCount} messages
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this saved conversation?')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectSession(session.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
