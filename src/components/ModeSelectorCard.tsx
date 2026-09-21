import React from 'react';
import { Zap, Brain, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { StudyMode } from '../types';

interface ModeSelectorCardProps {
  onSelectMode: (mode: 'easy' | 'teach') => void;
  isDisabled?: boolean;
}

export const ModeSelectorCard: React.FC<ModeSelectorCardProps> = ({
  onSelectMode,
  isDisabled = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-sm max-w-xl mx-auto w-full my-2 text-center"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mb-2 border border-emerald-100">
        <span className="text-lg font-bold">?</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
        How do you want help?
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-sm mx-auto">
        Choose how StudyAI should approach this question:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {/* Easy Answer Option */}
        <button
          type="button"
          id="mode-btn-easy"
          disabled={isDisabled}
          onClick={() => onSelectMode('easy')}
          className="group relative flex flex-col p-4 rounded-xl border-2 border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/90 hover:border-amber-400 active:scale-[0.98] transition-all cursor-pointer text-left shadow-2xs"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 text-white shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-current" />
              EASY ANSWER
            </span>
            <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs font-semibold text-gray-900 mb-0.5">
            Quick solution & answer
          </p>
          <p className="text-[11px] text-gray-500 leading-snug">
            Direct answer first, minimal steps, clean & short.
          </p>
        </button>

        {/* Teach Me Option */}
        <button
          type="button"
          id="mode-btn-teach"
          disabled={isDisabled}
          onClick={() => onSelectMode('teach')}
          className="group relative flex flex-col p-4 rounded-xl border-2 border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/90 hover:border-emerald-500 active:scale-[0.98] transition-all cursor-pointer text-left shadow-2xs"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-2xs">
              <Brain className="w-3.5 h-3.5" />
              TEACH ME
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs font-semibold text-gray-900 mb-0.5">
            Step-by-step breakdown
          </p>
          <p className="text-[11px] text-gray-500 leading-snug">
            What it asks, formulas, guided steps, and study tips.
          </p>
        </button>
      </div>
    </motion.div>
  );
};
