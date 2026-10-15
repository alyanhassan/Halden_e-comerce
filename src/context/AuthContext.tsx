import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  addAddress as addAddressService,
  changePassword as changePasswordService,
  deleteAddress as deleteAddressService,
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  setDefaultAddress as setDefaultAddressService,
  signup as signupService,
  updateAddress as updateAddressService,
  updateProfile as updateProfileService,
} from '../services/authService';
import { Address, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  updateAddress: (address: Address) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedIn = await loginService(email, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const signup = async (name: string, email: string, password: string) => {
    const signedUp = await signupService(name, email, password);
    setUser(signedUp);
    return signedUp;
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const updateProfile = async (name: string, email: string) => {
    const updated = await updateProfileService(name, email);
    setUser(updated);
    return updated;
  };

  const changePassword = async (current: string, next: string) => {
    await changePasswordService(current, next);
  };

  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    const addr = await addAddressService(addressData);
    await refreshUser();
    return addr;
  };

  const updateAddress = async (address: Address) => {
    const addr = await updateAddressService(address);
    await refreshUser();
    return addr;
  };

  const deleteAddress = async (id: string) => {
    await deleteAddressService(id);
    await refreshUser();
  };

  const setDefaultAddress = async (id: string) => {
    await setDefaultAddressService(id);
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
