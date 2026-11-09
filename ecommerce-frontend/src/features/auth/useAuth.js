import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * @returns {{
 *   user: {id:string,name:string,email:string}|null,
 *   status: 'loading'|'anonymous'|'authenticated',
 *   isAuthenticated: boolean, isResolving: boolean, isSubmitting: boolean,
 *   error: string|null,
 *   signIn: (credentials: {email:string,password:string}) => Promise<{ok:boolean,error?:string}>,
 *   signUp: (credentials: {name:string,email:string,password:string}) => Promise<{ok:boolean,error?:string}>,
 *   signOut: () => void, clearError: () => void,
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>. Check app/providers.jsx.');
  }
  return context;
}
