import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Correctly importing the auth object we initialized
import { auth } from '../firebase.ts';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const clearAICache = () => {
  console.log('Privacy Rule: Clearing cached AI session data...');
  const aiKeys = ['ai_session_history', 'ai_context_cache', 'last_ai_prompt'];
  aiKeys.forEach(key => localStorage.removeItem(key));
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event('ai-cache-cleared'));
};

export const authService = {
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);
      console.log(`User ${result.user.uid} authenticated.`);
      return { user: result.user, token };
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  },

  // For existing users
  login: async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const token = await getIdToken(userCredential.user);
      return { user: userCredential.user, token };
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  // For brand new users
  signup: async (email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const token = await getIdToken(userCredential.user);
      return { user: userCredential.user, token };
    } catch (error) {
      console.error('Signup Error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      clearAICache();
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};