import React, { useState, useEffect } from 'react';
import type { Student } from '../types';
import { checkBackendHealth, loginStudent, registerStudent } from '../services/api';
import { AuthContext } from './useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const recheckConnection = async () => {
    const isUp = await checkBackendHealth();
    setIsBackendConnected(isUp);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('student_token');
        const storedStudent = localStorage.getItem('student_profile');

        const isUp = await checkBackendHealth();
        setIsBackendConnected(isUp);

        if (storedToken && storedStudent) {
          setToken(storedToken);
          setStudent(JSON.parse(storedStudent));
        } else {
          setStudent(null);
          setToken(null);
          localStorage.removeItem('student_token');
          localStorage.removeItem('student_profile');
        }
      } catch (e) {
        console.warn('Auth initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (prn: string, pass: string) => {
    setIsLoading(true);
    try {
      const result = await loginStudent(prn, pass);
      setStudent(result.student);
      setToken(result.token);
      localStorage.setItem('student_token', result.token);
      localStorage.setItem('student_profile', JSON.stringify(result.student));
      recheckConnection();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    prn: string;
    email: string;
    password: string;
    department: string;
    section: string;
    semester: number;
  }) => {
    setIsLoading(true);
    try {
      const result = await registerStudent(data);
      setStudent(result.student);
      setToken(result.token);
      localStorage.setItem('student_token', result.token);
      localStorage.setItem('student_profile', JSON.stringify(result.student));
      recheckConnection();
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudent(updatedStudent);
    localStorage.setItem('student_profile', JSON.stringify(updatedStudent));
  };

  const logout = () => {
    setStudent(null);
    setToken(null);
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_profile');
  };


  return (
    <AuthContext.Provider
      value={{
        student,
        token,
        isAuthenticated: !!student,
        isLoading,
        isBackendConnected,
        login,
        register,
        updateStudent,
        logout,
        recheckConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
