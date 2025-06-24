import { useState, useEffect } from 'react';
import { User } from '../types';

const STORAGE_KEY = 'reporting_system_user';

const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin'
  },
  {
    id: 'user1',
    name: 'Ana Clara',
    email: 'anaclarauniminas@gmail.com',
    role: 'user',
    consultantEmail: 'anaclarauniminas@gmail.com' // Email para buscar no CRM
  },
  {
    id: 'user2',
    name: 'Carlos Santos',
    email: 'carlos.santos@company.com',
    role: 'user',
    consultantEmail: 'carlos.santos@company.com'
  }
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      window.location.reload();
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Clear global cache when logging out
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user'
  };
};