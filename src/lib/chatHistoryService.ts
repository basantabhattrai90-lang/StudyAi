import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage, ChatSessionMeta, Subject, StudyTone } from '../types';

const LOCAL_SESSIONS_PREFIX = 'studyai_sessions_';
const LOCAL_MESSAGES_PREFIX = 'studyai_msgs_';

const getLocalSessions = (userId: string): ChatSessionMeta[] => {
  try {
    const raw = localStorage.getItem(`${LOCAL_SESSIONS_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalSessions = (userId: string, sessions: ChatSessionMeta[]) => {
  try {
    localStorage.setItem(`${LOCAL_SESSIONS_PREFIX}${userId}`, JSON.stringify(sessions));
  } catch {}
};

export const saveChatSession = async (
  userId: string,
  sessionId: string,
  title: string,
  subject: Subject,
  tone: StudyTone,
  messages: ChatMessage[]
): Promise<void> => {
  if (!userId || !sessionId || messages.length === 0) return;

  const firstMsg = messages.find((m) => m.role === 'user') || messages[0];
  const preview = firstMsg.content ? firstMsg.content.slice(0, 80) : 'Problem analysis';

  const sessionMeta: ChatSessionMeta = {
    id: sessionId,
    userId,
    title: title || preview.slice(0, 35) || 'Study Session',
    subject,
    tone,
    createdAt: messages[0]?.timestamp || Date.now(),
    updatedAt: Date.now(),
    preview,
    messageCount: messages.length,
  };

  // Always mirror in localStorage for bulletproof offline & local account availability
  try {
    const localSessions = getLocalSessions(userId);
    const existingIdx = localSessions.findIndex((s) => s.id === sessionId);
    if (existingIdx >= 0) {
      localSessions[existingIdx] = sessionMeta;
    } else {
      localSessions.unshift(sessionMeta);
    }
    saveLocalSessions(userId, localSessions);
    localStorage.setItem(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, JSON.stringify(messages));
  } catch (e) {
    console.warn('Local storage session write warning:', e);
  }

  // Also attempt Firestore cloud save
  try {
    const sessionDocRef = doc(db, 'users', userId, 'sessions', sessionId);
    const sessionData = {
      ...sessionMeta,
      createdAt: new Date(sessionMeta.createdAt).toISOString(),
      updatedAt: new Date(sessionMeta.updatedAt).toISOString(),
    };

    await setDoc(sessionDocRef, sessionData, { merge: true });

    // Store messages in subcollection using batch
    const batch = writeBatch(db);
    const messagesCollection = collection(db, 'users', userId, 'sessions', sessionId, 'messages');

    // Only save up to recent 50 messages to stay clean and fast
    const messagesToSave = messages.slice(-50);
    for (const msg of messagesToSave) {
      const msgDocRef = doc(messagesCollection, msg.id);
      batch.set(
        msgDocRef,
        {
          id: msg.id,
          sessionId,
          userId,
          role: msg.role,
          content: msg.content || '',
          mode: msg.mode || 'easy',
          tone: msg.tone || tone,
          timestamp: msg.timestamp || Date.now(),
          image: msg.image ? msg.image.dataUrl : null,
          questionRefId: msg.questionRefId || null,
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (err) {
    console.warn('Firestore session sync note (local backup active):', err);
  }
};

export const subscribeToSessions = (
  userId: string,
  callback: (sessions: ChatSessionMeta[]) => void
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // Pre-load from local storage instantly
  const initialLocal = getLocalSessions(userId);
  if (initialLocal.length > 0) {
    callback(initialLocal);
  }

  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const sessions: ChatSessionMeta[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          sessions.push({
            id: data.id || docSnap.id,
            userId: data.userId || userId,
            title: data.title || 'Untitled Session',
            subject: (data.subject as Subject) || 'General',
            tone: (data.tone as StudyTone) || 'balanced',
            createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now(),
            preview: data.preview || '',
            messageCount: data.messageCount || 0,
          });
        });
        if (sessions.length > 0) {
          saveLocalSessions(userId, sessions);
          callback(sessions);
        } else if (initialLocal.length > 0) {
          callback(initialLocal);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('Firestore subscription fallback to local storage:', err);
        callback(getLocalSessions(userId));
      }
    );
  } catch {
    callback(getLocalSessions(userId));
    return () => {};
  }
};

export const loadSessionMessages = async (
  userId: string,
  sessionId: string
): Promise<ChatMessage[]> => {
  if (!userId || !sessionId) return [];

  // Try reading local messages first
  try {
    const raw = localStorage.getItem(`${LOCAL_MESSAGES_PREFIX}${sessionId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  try {
    const messagesRef = collection(db, 'users', userId, 'sessions', sessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);

    const messages: ChatMessage[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: data.id || docSnap.id,
        role: data.role as 'user' | 'assistant',
        content: data.content || '',
        mode: data.mode as 'easy' | 'teach' | undefined,
        tone: data.tone as StudyTone | undefined,
        timestamp: data.timestamp || Date.now(),
        image: data.image
          ? {
              dataUrl: data.image,
              name: 'Attached Image',
              mimeType: 'image/jpeg',
            }
          : undefined,
        questionRefId: data.questionRefId || undefined,
      });
    });

    if (messages.length > 0) {
      localStorage.setItem(`${LOCAL_MESSAGES_PREFIX}${sessionId}`, JSON.stringify(messages));
    }
    return messages;
  } catch (err) {
    console.warn('Failed to load session messages from Firestore, attempting local store:', err);
    try {
      const raw = localStorage.getItem(`${LOCAL_MESSAGES_PREFIX}${sessionId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};

export const deleteChatSession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  if (!userId || !sessionId) return;

  try {
    const local = getLocalSessions(userId).filter((s) => s.id !== sessionId);
    saveLocalSessions(userId, local);
    localStorage.removeItem(`${LOCAL_MESSAGES_PREFIX}${sessionId}`);
  } catch {}

  try {
    const sessionDocRef = doc(db, 'users', userId, 'sessions', sessionId);
    await deleteDoc(sessionDocRef);
  } catch (err) {
    console.warn('Firestore session delete note:', err);
  }
};
