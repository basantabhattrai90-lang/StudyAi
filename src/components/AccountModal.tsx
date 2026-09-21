import React, { useState } from 'react';
import { X, User as UserIcon, LogOut, Shield, Award, Target, Sparkles, Smile, Check } from 'lucide-react';
import { UserAccount, StudyTone } from '../types';
import { logOut, updateUserTonePreference } from '../lib/authService';
import { TONE_OPTIONS } from './ToneSelector';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onTonePreferenceChanged: (tone: StudyTone) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onTonePreferenceChanged,
}) => {
  const [selectedTone, setSelectedTone] = useState<StudyTone>(user.preferredTone || 'balanced');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelectTone = async (tone: StudyTone) => {
    setSelectedTone(tone);
    setIsSaving(true);
    try {
      await updateUserTonePreference(user.uid, tone);
      onTonePreferenceChanged(tone);
    } catch (e) {
      console.error('Failed to update tone preference', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      onClose();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
              {user.displayName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {user.displayName || 'Student Account'}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[240px]">
                {user.email || 'Guest User'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Account Status */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Status: {user.isAnonymous ? 'Guest Student' : 'Verified Member'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Cloud Saved
            </span>
          </div>

          {/* Tone Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Default Response Tone
            </label>
            <p className="text-xs text-gray-500 mb-2.5">
              Choose your default style when starting questions across subjects.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = selectedTone === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectTone(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <OptIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-600 ml-1" />}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {opt.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Log Out */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              id="logout-btn"
              onClick={handleLogOut}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of StudyAI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
