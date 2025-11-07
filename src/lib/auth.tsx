import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, getToken, setToken, clearToken } from './api';
import { Me } from './types';

interface AuthCtx {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, org_name: string) => Promise<void>;
  logout: () => void;
  me: Me | null;
  isLoading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTok(getToken());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!token) { 
      setMe(null); 
      setIsLoading(false);
      return; 
    }
    setIsLoading(true);
    authApi.me()
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const { token } = await authApi.login(email, password);
    setToken(token); 
    setTok(token);
  };

  const signup = async (email: string, password: string, org_name: string) => {
    const { token } = await authApi.signup(email, password, org_name);
    setToken(token); 
    setTok(token);
  };

  const logout = () => { 
    clearToken(); 
    setTok(null); 
    setMe(null); 
  };

  return (
    <Ctx.Provider value={{ token, login, signup, logout, me, isLoading }}>
      {children}
    </Ctx.Provider>
  );
}
