import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  signInAnonymously, 
  signInWithPopup,
  googleProvider,
  onAuthStateChanged, 
  FirebaseUser, 
  signOut,
  handleFirestoreError,
  OperationType 
} from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export interface AppUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  isAnonymous: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  firebaseAuthError: string | null;
  signInAnonymous: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileDetails: (displayName: string, bio?: string, photoURL?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  firebaseAuthError: null,
  signInAnonymous: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateProfileDetails: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);

  // Sync profile from Firestore with defensive fallback
  const fetchProfile = async (u: AppUser) => {
    const path = `users/${u.uid}`;
    try {
      const userRef = doc(db, 'users', u.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile(data);
      } else {
        const newProfile: UserProfile = {
          id: u.uid,
          displayName: u.displayName || `Cosmonaut-${u.uid.substring(0, 6).toUpperCase()}`,
          photoURL: u.photoURL || '',
          bio: 'Exploring space and technology on Elon Musk Space.',
          isAnonymous: u.isAnonymous,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile).catch(() => {});
        setProfile(newProfile);
      }

      // Check admin status
      const userEmail = u.email || '';
      const isAdminEmail = userEmail === 'pathogenmcb@gmail.com';
      try {
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        setIsAdmin(isAdminEmail || adminDoc.exists());
      } catch {
        setIsAdmin(isAdminEmail);
      }

    } catch (error) {
      console.warn('Could not sync user profile from Firestore:', error);
      // Fallback local profile so UI never breaks
      setProfile({
        id: u.uid,
        displayName: u.displayName || `Cosmonaut-${u.uid.substring(0, 6).toUpperCase()}`,
        photoURL: u.photoURL || '',
        bio: 'Exploring technology and space on the Elon Musk Space platform.',
        isAnonymous: u.isAnonymous,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsAdmin((u.email || '') === 'pathogenmcb@gmail.com');
    }
  };

  // Initialize or recover persistent anonymous local ID if Firebase Anonymous is disabled
  const getOrCreateLocalUser = (): AppUser => {
    let localId = localStorage.getItem('ems_local_uid');
    if (!localId) {
      localId = 'anon_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('ems_local_uid', localId);
    }
    const localName = localStorage.getItem('ems_local_name') || `Cosmonaut-${localId.substring(5, 10).toUpperCase()}`;
    return {
      uid: localId,
      displayName: localName,
      photoURL: null,
      email: null,
      isAnonymous: true
    };
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          email: firebaseUser.email,
          isAnonymous: firebaseUser.isAnonymous
        };
        setUser(appUser);
        await fetchProfile(appUser);
      } else {
        // Fallback to local session
        const local = getOrCreateLocalUser();
        setUser(local);
        setProfile({
          id: local.uid,
          displayName: local.displayName || 'Cosmonaut',
          bio: 'Exploring technology and space on the Elon Musk Space platform.',
          isAnonymous: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInAnonymous = async () => {
    setLoading(true);
    setFirebaseAuthError(null);
    try {
      const res = await signInAnonymously(auth);
      const appUser: AppUser = {
        uid: res.user.uid,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        email: res.user.email,
        isAnonymous: true
      };
      setUser(appUser);
      await fetchProfile(appUser);
    } catch (err: any) {
      console.warn('Firebase signInAnonymously status:', err?.code || err);
      if (err?.code === 'auth/admin-restricted-operation' || err?.code === 'auth/operation-not-allowed') {
        setFirebaseAuthError(
          'Firebase Anonymous Sign-in is not yet enabled in the Firebase Console. A secure local session is active.'
        );
      }
      // Ensure persistent local user exists
      const local = getOrCreateLocalUser();
      setUser(local);
      await fetchProfile(local);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setFirebaseAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const appUser: AppUser = {
        uid: res.user.uid,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        email: res.user.email,
        isAnonymous: false
      };
      setUser(appUser);
      await fetchProfile(appUser);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setFirebaseAuthError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
    localStorage.removeItem('ems_local_uid');
    const newLocal = getOrCreateLocalUser();
    setUser(newLocal);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfileDetails = async (displayName: string, bio?: string, photoURL?: string) => {
    if (!user) return;
    const cleanName = displayName.trim() || user.displayName || `User-${user.uid.substring(0, 5)}`;
    localStorage.setItem('ems_local_name', cleanName);

    const updates = {
      displayName: cleanName,
      bio: bio !== undefined ? bio.trim() : (profile?.bio || ''),
      photoURL: photoURL !== undefined ? photoURL : (profile?.photoURL || ''),
      updatedAt: new Date().toISOString()
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.warn('Firestore profile update skipped or offline, updating in-memory state.');
    }

    setProfile(prev => prev ? { ...prev, ...updates } : {
      id: user.uid,
      isAnonymous: user.isAnonymous,
      createdAt: new Date().toISOString(),
      ...updates
    });
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      firebaseAuthError,
      signInAnonymous,
      signInWithGoogle,
      logout,
      updateProfileDetails,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
