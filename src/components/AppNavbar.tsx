import React from 'react';
import {
  GraduationCap,
  Home,
  MessageSquare,
  History,
  User,
  Plus
} from 'lucide-react';
import { AppPage, UserAccount, StudyLanguage } from '../types';

interface AppNavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onNewChat: () => void;
  historyCount: number;
  hasActiveChat: boolean;
  user: UserAccount | null;
  currentLanguage: StudyLanguage;
  onSelectLanguage: (lang: StudyLanguage) => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  currentPage,
  onNavigate,
  onNewChat,
  historyCount,
  hasActiveChat,
  user,
  currentLanguage,
  onSelectLanguage,
}) => {
  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <GraduationCap className="w-5 h-5" strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
                  StudyAI
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  Tutor
                </span>
              </div>
              <p className="hidden sm:block text-xs text-gray-400 font-medium leading-none mt-1">
                AI Homework & Exam Assistant
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/80">
            <button
              type="button"
              id="nav-home-btn"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'home'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Home</span>
            </button>

            <button
              type="button"
              id="nav-chat-btn"
              onClick={() => onNavigate('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                currentPage === 'chat'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Ask Tutor</span>
              {hasActiveChat && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

            <button
              type="button"
              id="nav-history-btn"
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'history'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>Study History</span>
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-account-btn"
              onClick={() => onNavigate('account')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'account'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Account & Settings</span>
            </button>
          </nav>

          {/* Right Action: Language Toggle, Quick New Question Button & User pill */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Single Unified Language Switcher */}
            <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200 shrink-0">
              <button
                type="button"
                id="navbar-lang-en-btn"
                onClick={() => onSelectLanguage('english')}
                className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentLanguage === 'english'
                    ? 'bg-white text-gray-900 shadow-2xs border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="AI responds in English"
              >
                EN
              </button>
              <button
                type="button"
                id="navbar-lang-ne-btn"
                onClick={() => onSelectLanguage('nepali')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentLanguage === 'nepali'
                    ? 'bg-white text-emerald-900 shadow-2xs border border-emerald-300 ring-1 ring-emerald-500/20'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="AI ले नेपालीमा उत्तर दिनेछ (Nepali Mode)"
              >
                <span>🇳🇵</span>
                <span>नेपाली</span>
              </button>
            </div>

            <button
              type="button"
              id="top-new-chat-btn"
              onClick={() => {
                onNewChat();
                onNavigate('chat');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
              title="Start a new question"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Question</span>
            </button>

            <button
              type="button"
              id="user-profile-btn"
              onClick={() => onNavigate('account')}
              className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                currentPage === 'account'
                  ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              title="View your account & settings"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">
                {user?.displayName || (user ? 'Student' : 'Guest')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Always visible, accessible touch targets) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'home' ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('chat')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'chat' ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tutor</span>
          {hasActiveChat && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('history')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'history' ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">History</span>
          {historyCount > 0 && (
            <span className="absolute top-0 right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white">
              {historyCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('account')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'account' ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Account</span>
        </button>
      </div>
    </>
  );
};
