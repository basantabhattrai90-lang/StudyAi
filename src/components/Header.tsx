import React from 'react';
import {
  Sparkles,
  Plus,
  GraduationCap,
  History,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { Subject, StudyTone, UserAccount } from '../types';
import { ToneSelector } from './ToneSelector';

interface HeaderProps {
  onNewChat: () => void;
  activeSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  currentTone: StudyTone;
  onSelectTone: (tone: StudyTone) => void;
  messageCount: number;
  user: UserAccount | null;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

const SUBJECTS: Subject[] = [
  'General',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Studies',
  'Computer Science',
];

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
  activeSubject,
  onSelectSubject,
  currentTone,
  onSelectTone,
  messageCount,
  user,
  onOpenAuth,
  onOpenAccount,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand & History toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenHistory}
            id="open-history-btn"
            className="p-1.5 sm:p-2 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200/80 hover:border-emerald-200 transition-colors cursor-pointer relative"
            title="Open saved study history"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shadow-emerald-500/20 flex-shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900 leading-none">
                  StudyAI
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-gray-400 truncate mt-0.5">
                AI Homework & Step-by-Step Tutor
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Controls: Subject, Tone, New Chat, Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Subject selector */}
          <div className="hidden sm:flex items-center">
            <select
              value={activeSubject}
              onChange={(e) => onSelectSubject(e.target.value as Subject)}
              className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer shadow-2xs"
              title="Select study subject context"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'General' ? '📚 All Subjects' : `• ${sub}`}
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selector Component */}
          <ToneSelector
            currentTone={currentTone}
            activeSubject={activeSubject}
            onSelectTone={onSelectTone}
          />

          {/* New Chat Button */}
          <button
            id="new-chat-btn"
            onClick={onNewChat}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 bg-gray-100/90 hover:bg-emerald-50/80 active:bg-emerald-100 rounded-lg border border-gray-200/90 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
            title="Start a fresh chat conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* User Account / Auth Button */}
          {user ? (
            <button
              type="button"
              id="account-btn"
              onClick={onOpenAccount}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/60 transition-all cursor-pointer shadow-2xs"
              title={`Logged in as ${user.displayName || user.email || 'Student'}`}
            >
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {user.displayName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="hidden md:inline text-xs font-bold text-gray-700 max-w-[90px] truncate">
                {user.displayName || 'Student'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              id="auth-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Sign in or create an account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile subject scroll pills */}
      <div className="sm:hidden border-t border-gray-100 px-3 py-1.5 overflow-x-auto flex gap-1.5 no-scrollbar bg-gray-50/50">
        {SUBJECTS.map((sub) => (
          <button
            key={sub}
            onClick={() => onSelectSubject(sub)}
            className={`text-[11px] whitespace-nowrap px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
              activeSubject === sub
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>
    </header>
  );
};
