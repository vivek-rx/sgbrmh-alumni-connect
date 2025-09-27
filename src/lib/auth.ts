import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export function useAuth() {
  const [user, loading, error] = useAuthState(auth);
  const [signOut] = useSignOut(auth);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // TODO: Save additional user data to Firestore
    return result;
  };

  return {
    user,
    loading,
    error,
    signOut,
    signIn,
    signUp
  };
}