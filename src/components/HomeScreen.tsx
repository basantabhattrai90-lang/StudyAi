import React from 'react';
import {
  MessageSquare,
  Camera,
  Calculator,
  BookOpen,
  Globe2,
  Atom,
  FlaskConical,
  Dna,
  Terminal,
  Zap,
  Brain,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Subject, StudyTone, ChatSessionMeta, UserAccount } from '../types';

interface HomeScreenProps {
  onStartQuestion: (subject?: Subject, presetPrompt?: string) => void;
  onTriggerPhotoUpload: () => void;
  onSelectRecentSession: (sessionId: string) => void;
  onViewAllHistory: () => void;
  recentSessions: ChatSessionMeta[];
  user: UserAccount | null;
  currentMode?: 'easy' | 'teach';
  onSelectMode?: (mode: 'easy' | 'teach') => void;
}

interface SubjectCardData {
  subject: Subject;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: StudyTone;
  toneLabel: string;
  toneIcon: string;
  colorClass: string;
  description: string;
}

const SUBJECT_CARDS: SubjectCardData[] = [
  {
    subject: 'Mathematics',
    title: 'Mathematics',
    icon: Calculator,
    tone: 'concise',
    toneLabel: 'Concise Mode',
    toneIcon: '🎯',
    colorClass: 'from-blue-600 to-indigo-600',
    description: 'Algebra, calculus, geometry, and formulas',
  },
  {
    subject: 'English',
    title: 'English & Literature',
    icon: BookOpen,
    tone: 'formal',
    toneLabel: 'Formal Mode',
    toneIcon: '🎩',
    colorClass: 'from-purple-600 to-pink-600',
    description: 'Essay writing, grammar, analysis & rhetoric',
  },
  {
    subject: 'Social Studies',
    title: 'Social Studies & History',
    icon: Globe2,
    tone: 'engaging',
    toneLabel: 'Engaging Mode',
    toneIcon: '🌟',
    colorClass: 'from-amber-500 to-orange-600',
    description: 'World history, civics, geography & culture',
  },
  {
    subject: 'Physics',
    title: 'Physics',
    icon: Atom,
    tone: 'concise',
    toneLabel: 'Concise Mode',
    toneIcon: '🎯',
    colorClass: 'from-sky-600 to-cyan-600',
    description: 'Mechanics, kinematics, forces & energy',
  },
  {
    subject: 'Chemistry',
    title: 'Chemistry',
    icon: FlaskConical,
    tone: 'engaging',
    toneLabel: 'Engaging Mode',
    toneIcon: '🌟',
    colorClass: 'from-emerald-600 to-teal-600',
    description: 'Reactions, balancing equations, stoichiometry',
  },
  {
    subject: 'Biology',
    title: 'Biology',
    icon: Dna,
    tone: 'engaging',
    toneLabel: 'Engaging Mode',
    toneIcon: '🌟',
    colorClass: 'from-green-600 to-emerald-700',
    description: 'Cell biology, genetics, ecosystems & anatomy',
  },
  {
    subject: 'Computer Science',
    title: 'Computer Science',
    icon: Terminal,
    tone: 'concise',
    toneLabel: 'Concise Mode',
    toneIcon: '🎯',
    colorClass: 'from-slate-700 to-gray-900',
    description: 'Algorithms, data structures & programming',
  },
];

const EXAMPLE_STARTERS = [
  {
    title: 'Linear Equations',
    subject: 'Mathematics' as Subject,
    prompt: 'Solve 2x + 5 = 15 step by step',
  },
  {
    title: 'Photosynthesis',
    subject: 'Biology' as Subject,
    prompt: 'Explain photosynthesis simply with the chemical equation',
  },
  {
    title: 'Newton’s Laws',
    subject: 'Physics' as Subject,
    prompt: 'A 5 kg mass accelerates at 3 m/s². What is the net force applied?',
  },
  {
    title: 'Essay Thesis Statement',
    subject: 'English' as Subject,
    prompt: 'How do I formulate a strong thesis statement for an argumentative essay?',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartQuestion,
  onTriggerPhotoUpload,
  onSelectRecentSession,
  onViewAllHistory,
  recentSessions,
  user,
  currentMode = 'easy',
  onSelectMode,
}) => {
  const studentName = user?.displayName || 'Student';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12">
      {/* Hero Welcome Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-10 shadow-xl mb-10">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Powered Multi-Subject Tutor</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Hello, {studentName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-8">
            Ask any question or snap a photo of your homework worksheet. Get instant answers or structured step-by-step explanations.
          </p>

          {/* TWO PRIMARY VISIBLE ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              type="button"
              id="hero-ask-btn"
              onClick={() => onStartQuestion()}
              className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-base shadow-lg shadow-black/15 transition-all cursor-pointer group"
            >
              <MessageSquare className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>Ask a Question</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              id="hero-upload-btn"
              onClick={onTriggerPhotoUpload}
              className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-400/40 text-white font-bold text-base backdrop-blur-xs transition-all cursor-pointer group"
            >
              <Camera className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
              <span>Upload Worksheet Photo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two Modes Explainer (Selectable & Persistent) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Choose Your Answer Style</span>
            </h2>
            <p className="text-xs text-gray-500">
              Select once—StudyAI will answer directly in this mode without prompting you every time
            </p>
          </div>
          {currentMode && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active: {currentMode === 'easy' ? '⚡ Easy Answer' : '🧠 Teach Me'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelectMode && onSelectMode('easy')}
            className={`p-5 rounded-2xl border transition-all text-left flex items-start gap-4 cursor-pointer relative ${
              currentMode === 'easy'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-white hover:bg-amber-50/40 border-gray-200 shadow-2xs hover:border-amber-200'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    ⚡ Easy Answer Mode
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900">
                    Fast
                  </span>
                </div>
                {currentMode === 'easy' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Direct answer placed first, concise calculations, zero filler text. Perfect for fast homework checks.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode && onSelectMode('teach')}
            className={`p-5 rounded-2xl border transition-all text-left flex items-start gap-4 cursor-pointer relative ${
              currentMode === 'teach'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
                : 'bg-white hover:bg-emerald-50/40 border-gray-200 shadow-2xs hover:border-emerald-200'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/20">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    🧠 Teach Me Mode
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900">
                    Deep Learning
                  </span>
                </div>
                {currentMode === 'teach' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Structured pedagogical breakdown: Given facts, Core formula, Step-by-step logic, Final answer, and Study tips.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Subject Explorer Grid */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Explore by Subject
            </h2>
            <p className="text-xs text-gray-500">
              Each subject auto-adapts the AI tone (formal, concise, or engaging)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SUBJECT_CARDS.map((card) => {
            const IconComponent = card.icon;
            return (
              <button
                key={card.subject}
                type="button"
                onClick={() => onStartQuestion(card.subject)}
                className="p-4 rounded-2xl bg-white hover:bg-emerald-50/30 border border-gray-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.colorClass} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/70">
                      {card.toneIcon} {card.toneLabel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Start with {card.subject}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Questions or Sample Starters */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {recentSessions.length > 0 ? 'Recent Study Questions' : 'Popular Starter Questions'}
            </h2>
            <p className="text-xs text-gray-500">
              {recentSessions.length > 0
                ? 'Continue where you left off'
                : 'Click to test with a single tap'}
            </p>
          </div>

          {recentSessions.length > 0 && (
            <button
              type="button"
              onClick={onViewAllHistory}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All History ({recentSessions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectRecentSession(session.id)}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                      {session.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2">
                    {session.title}
                  </h4>
                  {session.preview && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                      "{session.preview}"
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_STARTERS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onStartQuestion(item.subject, item.prompt)}
                className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/40 border border-gray-200 hover:border-emerald-300 text-left transition-all shadow-2xs group cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {item.subject}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    "{item.prompt}"
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
