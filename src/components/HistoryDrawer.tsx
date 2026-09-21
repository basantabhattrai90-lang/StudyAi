import React from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ChatSessionMeta, Subject, StudyTone } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSessionMeta[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  isLoggedIn,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col border-r border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900">Study History</h3>
            <span className="text-[11px] font-semibold text-gray-400">
              ({sessions.length})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3 border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Question</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 custom-scrollbar">
          {!isLoggedIn ? (
            <div className="p-6 text-center text-gray-500">
              <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-gray-800">
                Sync chats to your account
              </p>
              <p className="text-[11px] text-gray-500 mt-1 mb-3">
                Log in or create a student account to automatically save your questions and step-by-step solutions.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
              <p className="text-xs font-medium">No saved study chats yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Your conversations will be saved here automatically.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50/90 border-emerald-200 shadow-2xs'
                      : 'bg-white hover:bg-gray-50/90 border-gray-200/70 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                      <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-1 rounded">
                        {session.subject}
                      </span>
                      {session.tone && (
                        <span className="text-gray-500 capitalize">
                          • {session.tone}
                        </span>
                      )}
                      <span>• {formatDate(session.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this saved conversation?')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete chat session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
