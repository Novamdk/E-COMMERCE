import { createContext } from 'react';

/** Separated from the provider component so fast refresh keeps working. */
export const AuthContext = createContext(null);
