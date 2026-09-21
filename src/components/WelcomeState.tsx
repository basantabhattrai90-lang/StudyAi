import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Zap,
  Brain,
  Camera,
  Calculator,
  Atom,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeStateProps {
  onSelectPrompt: (prompt: string) => void;
  onTriggerUpload: () => void;
}

const SAMPLE_PROMPTS = [
  {
    icon: Calculator,
    subject: 'Algebra',
    title: 'Solve linear equation',
    prompt: 'Solve 2x + 5 = 15',
  },
  {
    icon: Atom,
    subject: 'Biology',
    title: 'Explain photosynthesis',
    prompt: 'Explain photosynthesis simply.',
  },
  {
    icon: Sparkles,
    subject: 'Physics',
    title: 'Newton’s Second Law',
    prompt: 'A 5 kg object accelerates at 3 m/s². What is the net force?',
  },
  {
    icon: BookOpen,
    subject: 'Chemistry',
    title: 'Balance chemical equation',
    prompt: 'Balance the equation: Fe + O2 -> Fe2O3',
  },
];

export const WelcomeState: React.FC<WelcomeStateProps> = ({
  onSelectPrompt,
  onTriggerUpload,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center"
    >
      {/* Brand Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 mb-4">
        <GraduationCap className="w-8 h-8" strokeWidth={2.2} />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
        Welcome to StudyAI
      </h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-md mb-6 leading-relaxed">
        Your personal study assistant. Type a question or upload a photo of your homework worksheet to get started.
      </p>

      {/* Two Mode Explainer Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
        <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              ⚡ Easy Answer Mode
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-normal">
              Direct answer first, concise steps, minimal reading for quick checks.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              🧠 Teach Me Mode
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-normal">
              Step-by-step guidance with formulas, clear reasoning, and study tips.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Callout */}
      <button
        type="button"
        onClick={onTriggerUpload}
        className="w-full mb-6 p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
          <Camera className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold">Have a worksheet photo or diagram?</div>
          <div className="text-[11px] text-emerald-700">
            Click here or tap the paperclip below to upload an image
          </div>
        </div>
      </button>

      {/* Sample Starters */}
      <div className="w-full text-left">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Try an example question
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_PROMPTS.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className="group p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 active:scale-[0.99] transition-all cursor-pointer text-left flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-gray-600 flex items-center justify-center flex-shrink-0 transition-colors">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      "{item.prompt}"
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
