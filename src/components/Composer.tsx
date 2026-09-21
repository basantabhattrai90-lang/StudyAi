import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, Send, X, Loader2, Zap, Brain } from 'lucide-react';
import { ImageAttachment, StudyTone, StudyMode, StudyLanguage } from '../types';

interface ComposerProps {
  onSendMessage: (text: string, image?: ImageAttachment) => void;
  isLoading: boolean;
  disabled?: boolean;
  currentTone?: StudyTone;
  currentMode: 'easy' | 'teach';
  onSelectMode: (mode: 'easy' | 'teach') => void;
  currentLanguage: StudyLanguage;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  currentTone,
  currentMode,
  onSelectMode,
  currentLanguage,
}) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 150)}px`;
    }
  }, [text]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachment({
          dataUrl: reader.result,
          name: file.name,
          size: file.size,
          mimeType: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && !attachment) || isLoading || disabled) {
      return;
    }

    onSendMessage(trimmed, attachment || undefined);
    setText('');
    setAttachment(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (text.trim().length > 0 || attachment !== null) && !isLoading && !disabled;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-gray-200/90 py-2.5 px-3 sm:px-4 transition-all">
      <div className="max-w-4xl mx-auto">
        {/* Compact Persistent Mode Toggle */}
        <div className="flex items-center justify-between mb-1.5 px-0.5 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Mode:</span>
            <div className="inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200 shadow-2xs">
              <button
                type="button"
                id="composer-mode-easy-btn"
                onClick={() => onSelectMode('easy')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentMode === 'easy'
                    ? 'bg-white text-amber-900 shadow-2xs border border-amber-200'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Direct answer first with concise derivations"
              >
                <Zap
                  className={`w-3 h-3 ${
                    currentMode === 'easy'
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-400'
                  }`}
                />
                <span>Easy Answer</span>
              </button>

              <button
                type="button"
                id="composer-mode-teach-btn"
                onClick={() => onSelectMode('teach')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentMode === 'teach'
                    ? 'bg-white text-emerald-900 shadow-2xs border border-emerald-200'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Pedagogical step-by-step explanations, formulas, and key concepts"
              >
                <Brain
                  className={`w-3 h-3 ${
                    currentMode === 'teach' ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
                <span>Teach Me</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
            {currentTone && (
              <span className="hidden sm:inline font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60">
                Tone: <span className="capitalize text-gray-700 font-semibold">{currentTone}</span>
              </span>
            )}
            <span className="text-[10px] font-semibold text-gray-400">
              {currentLanguage === 'nepali' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
            </span>
          </div>
        </div>

        {/* Compact Image Preview inside Composer */}
        {attachment && (
          <div className="mb-2 flex items-center gap-2 p-1.5 pr-3 bg-gray-50 border border-gray-200/90 rounded-xl w-fit max-w-full">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300/60">
              <img
                src={attachment.dataUrl}
                alt="Attachment preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-[320px]">
                {attachment.name}
              </p>
              <p className="text-[10px] text-gray-500">
                Worksheet photo ready
              </p>
            </div>
            <button
              type="button"
              id="remove-attachment-btn"
              onClick={handleRemoveAttachment}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors ml-1 cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex items-end gap-2 bg-gray-50/90 hover:bg-gray-50 border ${
            isDragging
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
              : 'border-gray-200/90 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20'
          } rounded-2xl p-1.5 sm:p-2 transition-all`}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            id="attachment-file-input"
          />

          {/* Attachment Button (＋ / 📎) */}
          <button
            type="button"
            id="attachment-button"
            disabled={isLoading || disabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Upload photo of question or worksheet"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Expanding Multiline Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder={
              currentLanguage === 'nepali'
                ? currentMode === 'easy'
                  ? 'नेपालीमा छिटो उत्तर पाउन आफ्नो प्रश्न यहाँ लेख्नुहोस्...'
                  : 'नेपालीमा विस्तृत चरणबद्ध समाधानका लागि प्रश्न लेख्नुहोस्...'
                : currentMode === 'easy'
                ? 'Ask a question for a quick direct answer…'
                : 'Ask a question for a detailed step-by-step explanation…'
            }
            className="flex-1 max-h-[140px] resize-none bg-transparent py-2.5 px-1 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="button"
            id="send-button"
            disabled={!canSend}
            onClick={handleSend}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              canSend
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send question"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>

        {/* Small footer caption */}
        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-gray-400">
          <span>Enter to send, Shift + Enter for new line</span>
          <span className="hidden sm:inline">Answers generated instantly</span>
        </div>
      </div>
    </div>
  );
};
