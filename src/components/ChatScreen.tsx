import React, { useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  GraduationCap,
  Sparkles,
  Zap,
  Brain
} from 'lucide-react';
import {
  ChatMessage,
  ImageAttachment,
  Subject,
  StudyTone,
  StudyLanguage,
} from '../types';
import { MessageItem } from './MessageItem';
import { ModeSelectorCard } from './ModeSelectorCard';
import { Composer } from './Composer';
import { ToneSelector } from './ToneSelector';

interface ChatScreenProps {
  onBackToHome: () => void;
  onNewChat: () => void;
  messages: ChatMessage[];
  activeSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  currentTone: StudyTone;
  onSelectTone: (tone: StudyTone) => void;
  currentMode: 'easy' | 'teach';
  onSelectMode: (mode: 'easy' | 'teach') => void;
  currentLanguage: StudyLanguage;
  onSelectLanguage?: (lang: StudyLanguage) => void;
  isLoading: boolean;
  pendingQuestionId?: string | null;
  onSendMessage: (text: string, image?: ImageAttachment) => void;
  onRegenerate: (messageId: string) => void;
  onSwitchMode: (messageId: string, newMode: 'easy' | 'teach') => void;
  onSendFollowUp: (prompt: string) => void;
  onOpenImageModal: (url: string) => void;
  onTriggerPhotoUpload: () => void;
}

const ALL_SUBJECTS: Subject[] = [
  'General',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Studies',
  'Computer Science',
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBackToHome,
  onNewChat,
  messages,
  activeSubject,
  onSelectSubject,
  currentTone,
  onSelectTone,
  currentMode,
  onSelectMode,
  currentLanguage,
  isLoading,
  pendingQuestionId,
  onSendMessage,
  onRegenerate,
  onSwitchMode,
  onSendFollowUp,
  onOpenImageModal,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingQuestionId]);

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)] w-full bg-[#f9fafb] overflow-hidden">
      {/* Sub-header Toolbar */}
      <div className="w-full bg-white border-b border-gray-200 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 flex-shrink-0 z-20 shadow-2xs">
        {/* Left: Back button and subject label */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            id="chat-back-btn"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Subject Dropdown */}
          <select
            value={activeSubject}
            onChange={(e) => onSelectSubject(e.target.value as Subject)}
            className="text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
            title="Active subject context"
          >
            {ALL_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub === 'General' ? '📚 General' : `• ${sub}`}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Tone Selector & New Question Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ToneSelector
            currentTone={currentTone}
            activeSubject={activeSubject}
            onSelectTone={onSelectTone}
          />

          <button
            type="button"
            id="chat-new-question-btn"
            onClick={onNewChat}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:text-emerald-800 bg-gray-100 hover:bg-emerald-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">New Question</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="py-8 sm:py-14 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                StudyAI is ready for {activeSubject}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Type your question or attach a photo below.
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs text-emerald-800 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Mode: <strong className="font-bold">{currentMode === 'easy' ? '⚡ Easy Answer' : '🧠 Teach Me'}</strong>
                </span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onRegenerate={onRegenerate}
                  onSwitchMode={onSwitchMode}
                  onSendFollowUp={onSendFollowUp}
                  onOpenImageModal={onOpenImageModal}
                  isBusy={isLoading}
                />
              ))}

              {pendingQuestionId && (
                <ModeSelectorCard
                  onSelectMode={onSelectMode}
                  isDisabled={isLoading}
                />
              )}
            </>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Composer Area at the Bottom */}
      <div className="w-full flex-shrink-0 pb-14 md:pb-0">
        <Composer
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          disabled={Boolean(pendingQuestionId)}
          currentTone={currentTone}
          currentMode={currentMode}
          onSelectMode={onSelectMode}
          currentLanguage={currentLanguage}
        />
      </div>
    </div>
  );
};
