import React, { useState, useRef, useEffect } from 'react';
import { Target, Award, Sparkles, Smile, ChevronDown, Check } from 'lucide-react';
import { StudyTone, Subject } from '../types';

interface ToneSelectorProps {
  currentTone: StudyTone;
  activeSubject: Subject;
  onSelectTone: (tone: StudyTone) => void;
  compact?: boolean;
}

export interface ToneOption {
  id: StudyTone;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  recommendedFor: Subject[];
  badgeColor: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'concise',
    label: 'Concise',
    shortDesc: 'Direct, formula-driven, zero fluff',
    icon: Target,
    recommendedFor: ['Mathematics', 'Physics', 'Computer Science'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    id: 'formal',
    label: 'Formal',
    shortDesc: 'Academic, scholarly & precise vocabulary',
    icon: Award,
    recommendedFor: ['English'],
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    id: 'engaging',
    label: 'Engaging',
    shortDesc: 'Storytelling, vivid analogies & enthusiasm',
    icon: Sparkles,
    recommendedFor: ['Social Studies', 'Biology', 'Chemistry'],
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    shortDesc: 'Warm, encouraging peer-tutor tone',
    icon: Smile,
    recommendedFor: ['General'],
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  currentTone,
  activeSubject,
  onSelectTone,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = TONE_OPTIONS.find((t) => t.id === currentTone) || TONE_OPTIONS[3];
  const IconComponent = activeOption.icon;

  // Check if current tone is recommended for the active subject
  const isRecommended = activeOption.recommendedFor.includes(activeSubject);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        type="button"
        id="tone-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
        }`}
        title={`AI Explanation Tone: ${activeOption.label}. Click to switch.`}
      >
        <IconComponent className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="hidden sm:inline">Tone:</span>
        <span className="truncate max-w-[75px] sm:max-w-none">{activeOption.label}</span>
        {isRecommended && !compact && (
          <span className="hidden md:inline text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100/70 text-emerald-800">
            Suggested
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Select AI Response Tone
            </p>
            <p className="text-[11px] text-gray-500">
              StudyAI adapts vocabulary and style to match the subject.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {TONE_OPTIONS.map((option) => {
              const OptIcon = option.icon;
              const isSelected = option.id === currentTone;
              const isOptionRecommended = option.recommendedFor.includes(activeSubject);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelectTone(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border border-emerald-200/90'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <OptIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        {option.label}
                      </span>
                      {isOptionRecommended && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Best for {activeSubject}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {option.shortDesc}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
