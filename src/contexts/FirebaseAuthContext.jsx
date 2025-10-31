import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || userData.username || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, username) => {
    try {
      // Create user account
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: username
      });

      // Save user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        username,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create user document for new Google users
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      toast.success('Logged in with Google successfully!');
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Update Firebase Auth profile
        if (updates.displayName) {
          await updateProfile(currentUser, {
            displayName: updates.displayName,
            photoURL: updates.photoURL || currentUser.photoURL
          });
        }
        
        // Update Firestore user document
        await setDoc(doc(db, 'users', currentUser.uid), {
          ...updates,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Update local user state
        setUser(prev => ({
          ...prev,
          ...updates,
          username: updates.displayName || prev.username
        }));
        
        toast.success('Profile updated successfully!');
        return { success: true };
      }
      
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
