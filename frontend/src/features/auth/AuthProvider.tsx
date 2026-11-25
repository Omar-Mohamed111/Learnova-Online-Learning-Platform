import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../../lib/types";
import { api, API } from "../../lib/api";

type LoginResult = {
  requiresTwoFactor: boolean;
  email?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the latest authenticated user data
  const refreshUser = async (): Promise<void> => {
    const { data } = await api.get(API.auth.me);
    setUser(data.myProfile as User);
  };

  // Login with email and password
  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    const { data } = await api.post(API.auth.login, { email, password });

    // 2FA is enabled: wait for OTP verification
    if (data.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,
        email: data.email || email,
      };
    }

    // Normal login
    if (!data.user) {
      throw new Error("User data was not found in the login response.");
    }

    setUser(data.user as User);

    return {
      requiresTwoFactor: false,
    };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    await api.post(API.auth.register, { name, email, password });
  };

  const logout = async (): Promise<void> => {
    await api.post(API.auth.logout);
    setUser(null);
  };

  // Check existing session when the app starts
  useEffect(() => {
    refreshUser()
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
