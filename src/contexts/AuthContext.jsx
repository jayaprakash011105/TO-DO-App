import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('todo_app_token');
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        localStorage.setItem('todo_app_current_user', JSON.stringify(userData));
      } catch (error) {
        localStorage.removeItem('todo_app_token');
        localStorage.removeItem('todo_app_current_user');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      localStorage.setItem('todo_app_current_user', JSON.stringify(userData));
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      return { success: false, error: error.response?.data?.detail };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
