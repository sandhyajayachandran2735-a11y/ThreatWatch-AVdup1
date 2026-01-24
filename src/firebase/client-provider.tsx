'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider, useAuth, useUser } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from './non-blocking-login';

function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Only sign in anonymously if we are done loading and there is no user.
    // This prevents logged-in users from being converted to anonymous.
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  return <>{children}</>;
}


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthGate>
        {children}
      </AuthGate>
    </FirebaseProvider>
  );
}
