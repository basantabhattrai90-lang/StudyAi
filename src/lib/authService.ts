import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserAccount, StudyTone, StudyLanguage } from '../types';

const LOCAL_USER_KEY = 'studyai_local_student';
const authListeners: Array<(user: UserAccount | null) => void> = [];

export const getLocalUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveLocalUser = (user: UserAccount | null): void => {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch {}
};

const notifyAuthListeners = (user: UserAccount | null) => {
  for (const listener of authListeners) {
    try {
      listener(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  }
};

export const subscribeToAuthChanges = (callback: (user: UserAccount | null) => void) => {
  authListeners.push(callback);

  // Check if we have an active local student account first
  const currentLocal = getLocalUser();
  if (currentLocal) {
    callback(currentLocal);
  }

  const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      // If no firebase user, fallback to local user if one exists
      const local = getLocalUser();
      callback(local);
      return;
    }

    try {
      // Fetch or create profile in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      let preferredTone: StudyTone = 'balanced';
      let preferredLanguage: StudyLanguage = 'english';

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.preferredTone) {
          preferredTone = data.preferredTone as StudyTone;
        }
        if (data.preferredLanguage) {
          preferredLanguage = data.preferredLanguage as StudyLanguage;
        }
      } else {
        // Create initial profile
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'guest@studyai.app',
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Student' : 'Student'),
          preferredTone: 'balanced',
          preferredLanguage: 'english',
          createdAt: new Date().toISOString(),
        });
      }

      const verifiedUser: UserAccount = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Student' : 'Student'),
        preferredTone,
        preferredLanguage,
        isAnonymous: firebaseUser.isAnonymous,
        isLocalOnly: false,
      };

      saveLocalUser(verifiedUser);
      callback(verifiedUser);
    } catch (e) {
      console.warn('Error reading user profile from Firestore:', e);
      const fallbackUser: UserAccount = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Student' : 'Student'),
        preferredTone: 'balanced',
        preferredLanguage: 'english',
        isAnonymous: firebaseUser.isAnonymous,
        isLocalOnly: false,
      };
      saveLocalUser(fallbackUser);
      callback(fallbackUser);
    }
  });

  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) {
      authListeners.splice(idx, 1);
    }
    unsubscribeFirebase();
  };
};

export const signUp = async (email: string, pass: string, name: string): Promise<UserAccount> => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
    }

    // Save to Firestore
    try {
      const userDocRef = doc(db, 'users', credential.user.uid);
      await setDoc(userDocRef, {
        uid: credential.user.uid,
        email,
        displayName: name.trim() || 'Student',
        preferredTone: 'balanced',
        createdAt: new Date().toISOString(),
      });
    } catch (fsErr) {
      console.warn('Firestore profile write warning:', fsErr);
    }

    const newUser: UserAccount = {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: name.trim() || 'Student',
      preferredTone: 'balanced',
      isAnonymous: false,
      isLocalOnly: false,
    };
    saveLocalUser(newUser);
    notifyAuthListeners(newUser);
    return newUser;
  } catch (err: any) {
    // If Firebase Auth has Email/Password disabled (operation-not-allowed)
    if (err?.code === 'auth/operation-not-allowed' || String(err?.message).includes('operation-not-allowed')) {
      console.info('Firebase auth operation-not-allowed: Activating local student account.');
      const localId = `local-user-${Date.now()}`;
      const localAccount: UserAccount = {
        uid: localId,
        email,
        displayName: name.trim() || email.split('@')[0] || 'Student',
        preferredTone: 'balanced',
        preferredLanguage: 'english',
        isAnonymous: false,
        isLocalOnly: true,
      };
      saveLocalUser(localAccount);
      notifyAuthListeners(localAccount);
      return localAccount;
    }
    throw err;
  }
};

export const logIn = async (email: string, pass: string): Promise<UserAccount> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    const user: UserAccount = {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName || email.split('@')[0] || 'Student',
      preferredTone: 'balanced',
      isAnonymous: false,
      isLocalOnly: false,
    };
    saveLocalUser(user);
    notifyAuthListeners(user);
    return user;
  } catch (err: any) {
    if (err?.code === 'auth/operation-not-allowed' || String(err?.message).includes('operation-not-allowed')) {
      console.info('Firebase auth operation-not-allowed: Activating local student login.');
      const localId = `local-user-${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
      const localAccount: UserAccount = {
        uid: localId,
        email,
        displayName: email.split('@')[0] || 'Student',
        preferredTone: 'balanced',
        preferredLanguage: 'english',
        isAnonymous: false,
        isLocalOnly: true,
      };
      saveLocalUser(localAccount);
      notifyAuthListeners(localAccount);
      return localAccount;
    }
    throw err;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch {}
  saveLocalUser(null);
  notifyAuthListeners(null);
};

export const signInGuest = async (): Promise<UserAccount> => {
  try {
    const credential = await firebaseSignInAnonymously(auth);
    const guestUser: UserAccount = {
      uid: credential.user.uid,
      email: null,
      displayName: 'Guest Student',
      preferredTone: 'balanced',
      isAnonymous: true,
      isLocalOnly: false,
    };
    saveLocalUser(guestUser);
    notifyAuthListeners(guestUser);
    return guestUser;
  } catch {
    const localGuest: UserAccount = {
      uid: `local-guest-${Date.now()}`,
      email: null,
      displayName: 'Guest Student',
      preferredTone: 'balanced',
      isAnonymous: true,
      isLocalOnly: true,
    };
    saveLocalUser(localGuest);
    notifyAuthListeners(localGuest);
    return localGuest;
  }
};

export const updateUserTonePreference = async (userId: string, tone: StudyTone): Promise<void> => {
  const local = getLocalUser();
  if (local && local.uid === userId) {
    local.preferredTone = tone;
    saveLocalUser(local);
  }

  try {
    if (!local?.isLocalOnly) {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { preferredTone: tone });
    }
  } catch (e) {
    console.warn('Tone update in Firestore skipped/failed (using local storage):', e);
  }
};

export const updateUserLanguagePreference = async (userId: string, language: StudyLanguage): Promise<void> => {
  const local = getLocalUser();
  if (local && local.uid === userId) {
    local.preferredLanguage = language;
    saveLocalUser(local);
  }

  try {
    if (!local?.isLocalOnly) {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { preferredLanguage: language });
    }
  } catch (e) {
    console.warn('Language update in Firestore skipped/failed:', e);
  }
};
