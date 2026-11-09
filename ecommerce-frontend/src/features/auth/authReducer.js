/**
 * @typedef {{id: string, name: string, email: string}} User
 * @typedef {{user: User|null, status: 'loading'|'anonymous'|'authenticated',
 *            isSubmitting: boolean, error: string|null}} AuthState
 */

/** @type {AuthState} */
export const initialAuthState = {
  user: null,
  // Starts as 'loading' so ProtectedRoute waits for the stored session to be
  // read instead of bouncing an authenticated visitor to sign-in on refresh.
  status: 'loading',
  isSubmitting: false,
  error: null,
};

/**
 * @param {AuthState} state
 * @param {{type: string, payload?: any}} action
 * @returns {AuthState}
 */
export function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORED':
      return action.payload
        ? { ...state, user: action.payload, status: 'authenticated', error: null }
        : { ...state, user: null, status: 'anonymous', error: null };

    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };

    case 'SUBMIT_SUCCESS':
      return {
        user: action.payload,
        status: 'authenticated',
        isSubmitting: false,
        error: null,
      };

    case 'SUBMIT_FAILURE':
      return { ...state, isSubmitting: false, error: action.payload };

    case 'SIGN_OUT':
      return { user: null, status: 'anonymous', isSubmitting: false, error: null };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      throw new Error(`authReducer: unhandled action "${action.type}"`);
  }
}
