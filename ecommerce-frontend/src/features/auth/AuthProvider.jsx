import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { isAuthBackendEnabled } from '@/lib/backend';
import { STORAGE_KEYS } from '@/lib/constants';
import { identify } from '@/lib/klaviyo';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';
import * as authService from '@/services/authService';
import { AuthContext } from './AuthContext';
import { authReducer, initialAuthState } from './authReducer';

/**
 * Session state for the app. With the real backend the session lives in
 * Supabase (restored and kept in sync here); otherwise it is the demo
 * session in localStorage. See services/authService.js.
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    if (!isAuthBackendEnabled) {
      const session = readStorage(STORAGE_KEYS.SESSION, null);
      dispatch({ type: 'RESTORED', payload: session });
      if (session?.email) identify({ email: session.email, name: session.name });
      return undefined;
    }

    let isActive = true;
    let unsubscribe = () => {};
    authService.getCurrentUser().then((user) => {
      if (!isActive) return;
      dispatch({ type: 'RESTORED', payload: user });
      if (user?.email) identify({ email: user.email, name: user.name });
    });
    authService
      .onAuthChange((user) => {
        if (isActive) dispatch({ type: 'RESTORED', payload: user });
      })
      .then((stop) => {
        if (isActive) unsubscribe = stop;
        else stop();
      });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  /**
   * @param {'signIn'|'signUp'} method
   * @param {object} credentials
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  const submit = useCallback(async (method, credentials) => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const user = await authService[method](credentials);
      if (!isAuthBackendEnabled) writeStorage(STORAGE_KEYS.SESSION, user);
      dispatch({ type: 'SUBMIT_SUCCESS', payload: user });
      identify({ email: user.email, name: user.name });
      return { ok: true };
    } catch (error) {
      const message = error?.message ?? 'Something went wrong. Please try again.';
      dispatch({ type: 'SUBMIT_FAILURE', payload: message });
      return { ok: false, error: message };
    }
  }, []);

  const signIn = useCallback((credentials) => submit('signIn', credentials), [submit]);
  const signUp = useCallback((credentials) => submit('signUp', credentials), [submit]);

  const signOut = useCallback(() => {
    removeStorage(STORAGE_KEYS.SESSION);
    authService.signOut().catch(() => {});
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const value = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      isAuthenticated: state.status === 'authenticated',
      isResolving: state.status === 'loading',
      isSubmitting: state.isSubmitting,
      error: state.error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [
      state.user,
      state.status,
      state.isSubmitting,
      state.error,
      signIn,
      signUp,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
