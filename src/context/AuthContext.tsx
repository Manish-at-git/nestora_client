import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient, {
  hasSessionCookieHint,
  setAuthenticatedSession,
} from "@/services/api/apiClient";
import { store } from "@/app/store";
import { baseApi } from "@/services/api/baseApi";
import type { Account, RolePermission, UserProfile } from "@/types/auth";
import {
  connectSocket,
  disconnectSocket,
  listenSocketMessage,
  sendSocketMessage,
} from "@/services/realtime";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SessionAccount {
  account_id: string;
  email: string;
  name?: string | null;
  role: Account["role"];
  role_code: string;
  association_id?: string | null;
  role_permissions: RolePermission[];
}

interface AuthContextType {
  account: Account | null;
  profile: UserProfile | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<Account>;
  logout: () => Promise<void>;
  setAuthToken: (token: string, acct?: Account, prof?: UserProfile) => Promise<void>;
  connectRealtime: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  const toClientAccount = (account: SessionAccount): Account => ({
    id: account.account_id,
    email: account.email,
    name: account.name || undefined,
    role: account.role,
    role_code: account.role_code,
    association_id: account.association_id || undefined,
    role_permissions: account.role_permissions,
  });

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<SessionAccount>>("/auth/me");
      setAuthenticatedSession(true);
      setAccount(toClientAccount(response.data.data));
      setProfile(null);
    } catch {
      setAuthenticatedSession(false);
      store.dispatch(baseApi.util.resetApiState());
      setAccount(null);
      setProfile(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    // Anonymous browsers do not receive a CSRF/session cookie. Avoid a
    // needless /auth/me request and let protected routing redirect directly.
    if (!hasSessionCookieHint()) {
      setAuthenticatedSession(false);
      setChecking(false);
      return;
    }
    refresh();
  }, [refresh]);

  const connectRealtime = useCallback(async (): Promise<void> => {
    await connectSocket();
    const removeListener = listenSocketMessage((message) => {
      if (message.type === "server.sample") {
        console.info("[realtime]", message.message);
        removeListener();
      }
    });
    sendSocketMessage("client.sample", { message: "Hello from the logged-in client" });
  }, []);

  const login = async (email: string, password: string): Promise<Account> => {
    store.dispatch(baseApi.util.resetApiState());
    const response = await apiClient.post<ApiResponse<{ account: SessionAccount }>>("/auth/login", {
      email,
      password,
    });
    const account = toClientAccount(response.data.data.account);
    setAuthenticatedSession(true);
    setAccount(account);
    setProfile(null);
    await refresh();
    try {
      await connectRealtime();
    } catch {
      // Socket availability must not block normal login while realtime is being introduced.
    }
    return account;
  };

  const setAuthToken = async (token: string, acct?: Account, prof?: UserProfile): Promise<void> => {
    // Kept temporarily for the legacy access-code page. Cookie-session login never stores this token.
    store.dispatch(baseApi.util.resetApiState());
    void token;
    if (acct) {
      setAuthenticatedSession(true);
      setAccount(acct);
    }
    if (prof) setProfile(prof);
    await refresh();
    try {
      await connectRealtime();
    } catch {
      // Realtime availability must not block the legacy access-code session.
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    store.dispatch(baseApi.util.resetApiState());
    setAuthenticatedSession(false);
    setAccount(null);
    setProfile(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{ account, profile, checking, login, logout, setAuthToken, connectRealtime, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
