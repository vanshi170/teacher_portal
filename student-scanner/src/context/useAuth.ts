import { createContext, useContext } from 'react';
import type { Student } from '../types';

export interface AuthContextType {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendConnected: boolean;
  login: (prn: string, pass: string) => Promise<void>;
  register: (data: {
    name: string;
    prn: string;
    email: string;
    password: string;
    department: string;
    section: string;
    semester: number;
  }) => Promise<void>;
  updateStudent: (student: Student) => void;
  logout: () => void;
  recheckConnection: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
