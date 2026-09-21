import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Copy,
  Check,
  RotateCw,
  Zap,
  Brain,
  MessageSquare,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { motion } from 'motion/react';
import { ChatMessage, StudyMode } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onRegenerate: (messageId: string) => void;
  onSwitchMode: (messageId: string, newMode: 'easy' | 'teach') => void;
  onSendFollowUp: (prompt: string) => void;
  onOpenImageModal: (url: string) => void;
  isBusy: boolean;
}

const FOLLOW_UP_SUGGESTIONS = [
  'Why?',
  'Explain step 2.',
  'Give me another example.',
  'Make it easier.',
  'Try another method.',
];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRegenerate,
  onSwitchMode,
  onSendFollowUp,
  onOpenImageModal,
  isBusy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end my-3.5 px-1">
        <div className="max-w-[88%] sm:max-w-[78%] flex flex-col items-end">
          {/* User message card */}
          <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs">
            {/* Image attachment if any */}
            {message.image && (
              <div className="mb-2 relative group cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-black/10">
                <img
                  src={message.image.dataUrl}
                  alt={message.image.name || 'Uploaded question'}
                  className="max-h-64 w-auto rounded-lg object-contain"
                  onClick={() => onOpenImageModal(message.image!.dataUrl)}
                />
                <div
                  onClick={() => onOpenImageModal(message.image!.dataUrl)}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Click to expand</span>
                </div>
              </div>
            )}

            {/* Question Text */}
            {message.content && (
              <div className="text-[14.5px] leading-relaxed whitespace-pre-wrap font-medium">
                {message.content}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Response Card
  const modeLabel =
    message.mode === 'easy'
      ? '⚡ Easy Answer'
      : message.mode === 'teach'
      ? '🧠 Teach Me'
      : 'StudyAI';

  return (
    <div className="flex justify-start my-4 px-1">
      <div className="max-w-full sm:max-w-[92%] w-full flex gap-3">
        {/* StudyAI Avatar */}
        <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-2xs mt-1">
          <GraduationCap className="w-4 h-4" />
        </div>

        {/* AI Content Box */}
        <div className="flex-1 bg-white border border-gray-200/90 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs overflow-hidden">
          {/* Header with Mode Badge */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="sm:hidden flex w-5 h-5 rounded-md bg-emerald-600 items-center justify-center text-white">
                <GraduationCap className="w-3 h-3" />
              </span>
              <span className="text-xs font-bold text-gray-900 tracking-tight">StudyAI</span>
              {message.mode && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    message.mode === 'easy'
                      ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                  }`}
                >
                  {modeLabel}
                </span>
              )}

              {message.tone && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-gray-50 text-gray-600 border-gray-200/80 capitalize">
                  {message.tone === 'concise' && '🎯'}
                  {message.tone === 'formal' && '🎩'}
                  {message.tone === 'engaging' && '🌟'}
                  {message.tone === 'balanced' && '🤝'}
                  <span>{message.tone}</span>
                </span>
              )}
            </div>

            {message.isStreaming && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Generating...
              </span>
            )}
          </div>

          {/* Formatted Markdown Content */}
          <div className="study-markdown text-gray-800 text-[14.5px] leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>

            {/* Blinking cursor while streaming */}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-emerald-600 animate-pulse ml-0.5 rounded-xs align-middle" />
            )}
          </div>

          {/* Action Toolbar under AI Response */}
          {!message.isStreaming && message.content && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              {/* Left Action Buttons: Copy & Regenerate */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Copy response to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRegenerate(message.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer"
                  title="Regenerate this answer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-gray-500" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Right Mode Switchers (Requirement 8):
                  "Under every AI response include small buttons:
                   - 📋 Copy
                   - 🔄 Regenerate
                   - 🧠 Teach Me
                   - ⚡ Easy Answer
                   If the user switches between Easy Answer and Teach Me,
                   use the same question without requiring them to upload it again." */}
              <div className="flex items-center gap-1.5">
                {message.mode !== 'teach' && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onSwitchMode(message.id, 'teach')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Switch this question to step-by-step Teach Me mode"
                  >
                    <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    <span>🧠 Teach Me</span>
                  </button>
                )}

                {message.mode !== 'easy' && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onSwitchMode(message.id, 'easy')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Switch this question to direct Easy Answer mode"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
                    <span>⚡ Easy Answer</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Continuous Chat Suggestion Chips */}
          {!message.isStreaming && message.content && (
            <div className="mt-3 pt-2.5 border-t border-gray-50 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Ask next:
              </span>
              {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onSendFollowUp(suggestion)}
                  className="text-xs bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-full px-2.5 py-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
