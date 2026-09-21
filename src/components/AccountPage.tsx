import React, { useState } from 'react';
import {
  User,
  LogOut,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  Globe,
  Info,
  ShieldCheck
} from 'lucide-react';
import { UserAccount, StudyTone, StudyLanguage } from '../types';
import {
  signUp,
  logIn,
  logOut as authLogOut,
  updateUserTonePreference,
  updateUserLanguagePreference,
} from '../lib/authService';
import { TONE_OPTIONS } from './ToneSelector';

interface AccountPageProps {
  user: UserAccount | null;
  onTonePreferenceChanged: (tone: StudyTone) => void;
  currentLanguage: StudyLanguage;
  onLanguagePreferenceChanged: (lang: StudyLanguage) => void;
  savedSessionsCount: number;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  onTonePreferenceChanged,
  currentLanguage,
  onLanguagePreferenceChanged,
  savedSessionsCount,
}) => {
  const [selectedTone, setSelectedTone] = useState<StudyTone>(user?.preferredTone || 'balanced');
  const [selectedLang, setSelectedLang] = useState<StudyLanguage>(currentLanguage || 'english');
  const [isUpdatingTone, setIsUpdatingTone] = useState(false);

  // Form states for login/signup if not logged in
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const handleToneChange = async (tone: StudyTone) => {
    setSelectedTone(tone);
    if (user?.uid) {
      setIsUpdatingTone(true);
      try {
        await updateUserTonePreference(user.uid, tone);
        onTonePreferenceChanged(tone);
      } catch (e) {
        console.error('Failed to update tone preference', e);
      } finally {
        setIsUpdatingTone(false);
      }
    } else {
      onTonePreferenceChanged(tone);
    }
  };

  const handleLanguageChange = async (lang: StudyLanguage) => {
    setSelectedLang(lang);
    onLanguagePreferenceChanged(lang);
    if (user?.uid) {
      try {
        await updateUserLanguagePreference(user.uid, lang);
      } catch (e) {
        console.error('Failed to update language preference', e);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);
    setAuthLoading(true);

    try {
      if (authTab === 'signup') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter your email and a password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const created = await signUp(email.trim(), password, name.trim());
        if (created.isLocalOnly) {
          setAuthNotice(
            'Account activated in Local Student Mode! All your questions and settings are saved locally without interruption.'
          );
        }
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter your email and password.');
        }
        const logged = await logIn(email.trim(), password);
        if (logged.isLocalOnly) {
          setAuthNotice(
            'Logged in via Local Student Mode! Your study history and settings are active.'
          );
        }
      }
    } catch (err: any) {
      let msg = err?.message || 'Authentication failed.';
      if (msg.includes('operation-not-allowed') || err?.code === 'auth/operation-not-allowed') {
        msg =
          'Firebase Email/Password provider is not yet enabled in Firebase Console. You can continue with full functionality in Local Student mode!';
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please try again.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please log in.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogOut = async () => {
    if (confirm('Are you sure you want to log out of StudyAI?')) {
      await authLogOut();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
          <User className="w-3.5 h-3.5 text-emerald-600" />
          <span>Student Account</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Account & Tutor Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your student profile, default response language, tone, and study history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* Profile Card */}
          <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-2xs text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 mb-3">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
            </div>

            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {user?.displayName || (user ? 'Student Account' : 'Guest Student')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
              {user?.email || 'Local Student'}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 w-full flex items-center justify-between text-xs text-gray-600">
              <span>Saved Questions:</span>
              <strong className="text-emerald-700 font-bold">{savedSessionsCount}</strong>
            </div>

            <div className="mt-2 w-full flex items-center justify-between text-xs text-gray-600">
              <span>Storage Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  user?.isLocalOnly
                    ? 'text-amber-800 bg-amber-50 border border-amber-200/60'
                    : user && !user.isAnonymous
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-gray-700 bg-gray-100'
                }`}
              >
                {user?.isLocalOnly ? 'Local (Saved)' : user && !user.isAnonymous ? 'Cloud Sync' : 'Local Guest'}
              </span>
            </div>

            <div className="mt-2 w-full flex items-center justify-between text-xs text-gray-600">
              <span>AI Language:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                {currentLanguage === 'nepali' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
              </span>
            </div>

            {user && (
              <button
                type="button"
                onClick={handleLogOut}
                className="mt-6 w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              StudyAI preserves every solved question and follow-up explanation so you can review anytime.
            </p>
          </div>
        </div>

        {/* Right Column: Settings and/or Login */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Response Language Selection Card */}
          <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-gray-900">
                Response Language / जवाफको भाषा
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Choose the language for AI explanations, formulas, and teaching steps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="lang-english-btn"
                onClick={() => handleLanguageChange('english')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  selectedLang === 'english'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-2xs ring-1 ring-emerald-500/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="text-2xl flex-shrink-0">🇬🇧</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>English (Default)</span>
                    {selectedLang === 'english' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    Standard international curriculum explanations and terminology.
                  </p>
                </div>
              </button>

              <button
                type="button"
                id="lang-nepali-btn"
                onClick={() => handleLanguageChange('nepali')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  selectedLang === 'nepali'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-2xs ring-1 ring-emerald-500/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="text-2xl flex-shrink-0">🇳🇵</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>नेपाली (Nepali)</span>
                    {selectedLang === 'nepali' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    सम्पूर्ण समाधान र व्याख्या सरल नेपाली भाषामा (SEE, NEB तथा कक्षा ८-१२ उपयोगी)।
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sign Up / Log In box if not registered */}
          {(!user || user.isAnonymous) && (
            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {authTab === 'signup' ? 'Create Student Profile' : 'Student Log In'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Save your homework and study history across sessions.
                  </p>
                </div>
              </div>

              {/* Toggle Tabs */}
              <div className="flex items-center p-1 bg-gray-100 rounded-xl mb-4 border border-gray-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setAuthError(null);
                    setAuthNotice(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authTab === 'signup'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError(null);
                    setAuthNotice(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Log In
                </button>
              </div>

              {authNotice && (
                <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{authNotice}</span>
                </div>
              )}

              {authError && (
                <div className="p-3 mb-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
                {authTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya / Aarav"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{authTab === 'signup' ? 'Start Studying' : 'Log In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tone Preference Settings Card */}
          <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-2xs">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Default AI Response Style
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              StudyAI adapts its tone per subject. Choose your default preference when starting questions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONE_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = selectedTone === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToneChange(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-2xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <OptIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        {opt.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
