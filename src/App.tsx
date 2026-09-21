import React, { useState, useRef, useEffect } from 'react';
import { AppNavbar } from './components/AppNavbar';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { HistoryPage } from './components/HistoryPage';
import { AccountPage } from './components/AccountPage';
import { AuthModal } from './components/AuthModal';
import { ImageModal } from './components/ImageModal';
import {
  AppPage,
  ChatMessage,
  ImageAttachment,
  StudyMode,
  Subject,
  StudyTone,
  StudyLanguage,
  UserAccount,
  ChatSessionMeta,
} from './types';
import { subscribeToAuthChanges, updateUserLanguagePreference } from './lib/authService';
import {
  saveChatSession,
  subscribeToSessions,
  loadSessionMessages,
  deleteChatSession,
} from './lib/chatHistoryService';
import { AlertCircle, X } from 'lucide-react';

const SUBJECT_TONE_MAP: Record<Subject, StudyTone> = {
  Mathematics: 'concise',
  Physics: 'concise',
  'Computer Science': 'concise',
  English: 'formal',
  'Social Studies': 'engaging',
  Biology: 'engaging',
  Chemistry: 'engaging',
  General: 'balanced',
};

export default function App() {
  // Navigation state: 'home' | 'chat' | 'history' | 'account'
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Study & Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject>('General');
  const [currentTone, setCurrentTone] = useState<StudyTone>('balanced');
  const [currentSessionId, setCurrentSessionId] = useState<string>(`session-${Date.now()}`);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<'easy' | 'teach'>(() => {
    const saved = localStorage.getItem('studyai_default_mode');
    return saved === 'teach' ? 'teach' : 'easy';
  });
  const [currentLanguage, setCurrentLanguage] = useState<StudyLanguage>(() => {
    const saved = localStorage.getItem('studyai_language');
    return saved === 'nepali' || saved === 'english' ? saved : 'english';
  });
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth & Account states
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([]);

  // Hidden file input ref for triggering uploads from home screen
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Sync browser history so back button works naturally across pages
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: AppPage) => {
    setCurrentPage(page);
    window.history.pushState({ page }, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((account) => {
      setUser(account);
      if (account?.preferredTone) {
        setCurrentTone(account.preferredTone);
      }
      if (account?.preferredLanguage) {
        setCurrentLanguage(account.preferredLanguage);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSelectLanguage = (lang: StudyLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('studyai_language', lang);
    if (user?.uid) {
      updateUserLanguagePreference(user.uid, lang);
    }
  };

  // Subscribe to Firestore Chat Sessions when user is logged in
  useEffect(() => {
    if (!user?.uid) {
      setSessions([]);
      return;
    }

    const unsubscribe = subscribeToSessions(user.uid, (loadedSessions) => {
      setSessions(loadedSessions);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Auto-save chat session to Firestore when messages finish streaming
  useEffect(() => {
    if (!user?.uid || messages.length === 0 || isLoading) return;

    const isAnyStreaming = messages.some((m) => m.isStreaming);
    if (isAnyStreaming) return;

    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg?.content
      ? firstUserMsg.content.slice(0, 36)
      : 'Homework Problem';

    saveChatSession(
      user.uid,
      currentSessionId,
      title,
      activeSubject,
      currentTone,
      messages
    );
  }, [messages, isLoading, user?.uid, currentSessionId, activeSubject, currentTone]);

  // Subject selection with tone preset
  const handleSelectSubject = (subject: Subject) => {
    setActiveSubject(subject);
    const recommendedTone = SUBJECT_TONE_MAP[subject] || 'balanced';
    setCurrentTone(recommendedTone);
  };

  // Tone selection
  const handleSelectTone = (tone: StudyTone) => {
    setCurrentTone(tone);
  };

  // New Chat
  const handleNewChat = () => {
    setMessages([]);
    setPendingQuestionId(null);
    setErrorMessage(null);
    setCurrentSessionId(`session-${Date.now()}`);
  };

  // Start question from Home screen
  const handleStartQuestion = (subject?: Subject, presetPrompt?: string) => {
    if (subject) {
      handleSelectSubject(subject);
    }
    navigateTo('chat');

    if (presetPrompt) {
      setTimeout(() => {
        handleSendMessage(presetPrompt);
      }, 100);
    }
  };

  // Trigger worksheet photo upload
  const handleTriggerPhotoUpload = () => {
    hiddenFileInputRef.current?.click();
  };

  // Process image file uploaded from Home or external trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const attachment: ImageAttachment = {
          dataUrl: reader.result,
          name: file.name,
          size: file.size,
          mimeType: file.type,
        };

        // Navigate to chat and send message with photo
        navigateTo('chat');
        handleSendMessage('Please help me solve the question in this photo.', attachment);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.value = '';
    }
  };

  // Select a session from history or home
  const handleSelectSession = async (sessionId: string) => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const loadedMessages = await loadSessionMessages(user.uid, sessionId);
      const sessionMeta = sessions.find((s) => s.id === sessionId);

      if (sessionMeta) {
        setActiveSubject(sessionMeta.subject);
        setCurrentTone(sessionMeta.tone);
      }

      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
      setPendingQuestionId(null);
      setErrorMessage(null);
      navigateTo('chat');
    } catch (err) {
      console.error('Failed to load session:', err);
      setErrorMessage('Could not load this conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (!user?.uid) return;
    await deleteChatSession(user.uid, sessionId);
    if (sessionId === currentSessionId) {
      handleNewChat();
    }
  };

  // Send message
  const handleSendMessage = async (text: string, image?: ImageAttachment) => {
    const trimmed = text.trim();
    if (!trimmed && !image) {
      setErrorMessage('Please type a question or attach an image.');
      return;
    }

    setErrorMessage(null);
    setPendingQuestionId(null);

    const questionId = `msg-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: questionId,
      role: 'user',
      content: trimmed,
      image,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Directly answer in the user's selected mode!
    // No more tedious intermediate blocking cards on every single prompt
    await executeAIResponse(userMessage, currentMode, updatedMessages);
  };

  // Select Easy Answer or Teach Me (sets default mode & answers pending if any)
  const handleSelectMode = async (mode: 'easy' | 'teach') => {
    setCurrentMode(mode);
    localStorage.setItem('studyai_default_mode', mode);

    if (pendingQuestionId) {
      const userMsg = messages.find((m) => m.id === pendingQuestionId);
      setPendingQuestionId(null);
      if (userMsg) {
        await executeAIResponse(userMsg, mode, messages);
      }
    }
  };

  // Streaming AI response execution
  const executeAIResponse = async (
    userMsg: ChatMessage,
    mode: StudyMode,
    conversationHistory: ChatMessage[],
    targetAssistantMsgId?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    const assistantMsgId = targetAssistantMsgId || `ai-${Date.now()}`;
    const resolvedMode = mode === 'followup' ? 'easy' : mode;

    setMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === assistantMsgId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          content: '',
          mode: resolvedMode,
          tone: currentTone,
          language: currentLanguage,
          isStreaming: true,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          mode: resolvedMode,
          tone: currentTone,
          language: currentLanguage,
          timestamp: Date.now(),
          isStreaming: true,
          questionRefId: userMsg.id,
          originalQuestion: {
            text: userMsg.content,
            image: userMsg.image,
          },
        },
      ];
    });

    try {
      const historyPayload = conversationHistory
        .filter((m) => m.id !== assistantMsgId)
        .map((m) => ({
          role: m.role,
          content: m.content,
          image: m.image ? m.image.dataUrl : undefined,
        }));

      let contextualQuestion = userMsg.content;
      if (activeSubject !== 'General' && !userMsg.content.toLowerCase().includes(activeSubject.toLowerCase())) {
        contextualQuestion = `[Subject: ${activeSubject}] ${userMsg.content}`;
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: historyPayload.slice(0, -1),
          question: contextualQuestion,
          image: userMsg.image ? userMsg.image.dataUrl : undefined,
          mode,
          tone: currentTone,
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body returned from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data: ')) continue;

          const jsonString = trimmedLine.replace(/^data: /, '').trim();
          if (!jsonString) continue;

          let serverStreamError: string | null = null;
          try {
            const parsed = JSON.parse(jsonString);
            if (parsed.text) {
              accumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: accumulatedText, isStreaming: true }
                    : m
                )
              );
            }
            if (parsed.error) {
              serverStreamError = parsed.error;
            }
          } catch (err: any) {
            if (err.message && err.message !== 'Unexpected end of JSON input') {
              console.warn('SSE Parse warning:', err);
            }
          }

          if (serverStreamError) {
            throw new Error(serverStreamError);
          }
        }
      }

      // Mark completed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      let friendlyError = err?.message || "I couldn't process this request. Please try again.";

      // If error message contains stringified JSON from API
      try {
        if (friendlyError.includes('{')) {
          const start = friendlyError.indexOf('{');
          const end = friendlyError.lastIndexOf('}');
          if (start !== -1 && end > start) {
            const parsed = JSON.parse(friendlyError.slice(start, end + 1));
            let candidate = parsed?.error?.message || parsed?.message;
            if (typeof candidate === 'string') {
              if (candidate.includes('{')) {
                try {
                  const inner = JSON.parse(candidate);
                  candidate = inner?.error?.message || inner?.message || candidate;
                } catch {}
              }
              friendlyError = candidate;
            }
          }
        }
      } catch {}

      if (friendlyError.includes('503') || friendlyError.includes('high demand') || friendlyError.includes('UNAVAILABLE')) {
        friendlyError = 'The AI model is experiencing high demand right now. Please tap "Regenerate" or try again in a few moments.';
      } else if (friendlyError.includes('429') || friendlyError.includes('RESOURCE_EXHAUSTED')) {
        friendlyError = 'Rate limit temporarily reached. Please wait a moment and try again.';
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `⚠️ **StudyAI Notice:**\n${friendlyError}\n\n*Tap the Regenerate button below to retry.*`,
                isStreaming: false,
              }
            : m
        )
      );
      setErrorMessage(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate
  const handleRegenerate = async (assistantMsgId: string) => {
    const aiMsg = messages.find((m) => m.id === assistantMsgId);
    if (!aiMsg) return;

    const userMsg =
      messages.find((m) => m.id === aiMsg.questionRefId) ||
      (aiMsg.originalQuestion
        ? {
            id: aiMsg.questionRefId || 'orig',
            role: 'user' as const,
            content: aiMsg.originalQuestion.text,
            image: aiMsg.originalQuestion.image,
            timestamp: Date.now(),
          }
        : null);

    if (!userMsg) return;

    const mode = aiMsg.mode || 'easy';
    const priorHistory = messages.slice(
      0,
      messages.findIndex((m) => m.id === assistantMsgId)
    );

    await executeAIResponse(userMsg, mode, priorHistory, assistantMsgId);
  };

  // Switch Mode (Easy Answer <-> Teach Me)
  const handleSwitchMode = async (
    assistantMsgId: string,
    newMode: 'easy' | 'teach'
  ) => {
    const aiMsg = messages.find((m) => m.id === assistantMsgId);
    if (!aiMsg) return;

    const userMsg =
      messages.find((m) => m.id === aiMsg.questionRefId) ||
      (aiMsg.originalQuestion
        ? {
            id: aiMsg.questionRefId || 'orig',
            role: 'user' as const,
            content: aiMsg.originalQuestion.text,
            image: aiMsg.originalQuestion.image,
            timestamp: Date.now(),
          }
        : null);

    if (!userMsg) return;

    const priorHistory = messages.slice(
      0,
      messages.findIndex((m) => m.id === assistantMsgId)
    );

    await executeAIResponse(userMsg, newMode, priorHistory, assistantMsgId);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#f9fafb] text-gray-900 font-sans">
      {/* Hidden input for Home screen photo uploads */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Top / Bottom Navigation */}
      <AppNavbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onNewChat={handleNewChat}
        historyCount={sessions.length}
        hasActiveChat={messages.length > 0}
        user={user}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Floating Error Toast */}
      {errorMessage && (
        <div className="max-w-md mx-auto w-full px-4 pt-3 z-30">
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-amber-100 rounded text-amber-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Page Content View Router */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && (
          <HomeScreen
            onStartQuestion={handleStartQuestion}
            onTriggerPhotoUpload={handleTriggerPhotoUpload}
            onSelectRecentSession={handleSelectSession}
            onViewAllHistory={() => navigateTo('history')}
            recentSessions={sessions}
            user={user}
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
          />
        )}

        {currentPage === 'chat' && (
          <ChatScreen
            onBackToHome={() => navigateTo('home')}
            onNewChat={handleNewChat}
            messages={messages}
            activeSubject={activeSubject}
            onSelectSubject={handleSelectSubject}
            currentTone={currentTone}
            onSelectTone={handleSelectTone}
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            currentLanguage={currentLanguage}
            onSelectLanguage={handleSelectLanguage}
            isLoading={isLoading}
            pendingQuestionId={pendingQuestionId}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            onSwitchMode={handleSwitchMode}
            onSendFollowUp={handleSendMessage}
            onOpenImageModal={setActiveImageModal}
            onTriggerPhotoUpload={handleTriggerPhotoUpload}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onStartNewChat={() => {
              handleNewChat();
              navigateTo('chat');
            }}
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentPage === 'account' && (
          <AccountPage
            user={user}
            onTonePreferenceChanged={(tone) => setCurrentTone(tone)}
            currentLanguage={currentLanguage}
            onLanguagePreferenceChanged={handleSelectLanguage}
            savedSessionsCount={sessions.length}
          />
        )}
      </main>

      {/* Shared Modals */}
      <ImageModal
        imageUrl={activeImageModal}
        onClose={() => setActiveImageModal(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
