"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, userApi } from "@/lib/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // On mount: try to restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      userApi
        .getProfile()
        .then((data) => {
          setUser(data.user || data);
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // Listen for forced logout (from api interceptor on failed refresh)
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem("accessToken");
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const sendOtp = useCallback(async (identifier) => {
    const res = await authApi.sendOtp(identifier);
    return res;
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    const res = await authApi.loginWithPassword(email, password);
    const { accessToken, user: userData } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (identifier, otp) => {
    const res = await authApi.verifyOtp(identifier, otp);
    const { accessToken, user: userData } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(userData);
    return userData;
  }, []);

  // MSG91 widget login: exchange the widget's access-token for an app session.
  // `accessTokenFromWidget` is the MSG91 JWT; the destructured `accessToken` is
  // our own app JWT returned by the backend.
  const loginWithWidgetToken = useCallback(async (accessTokenFromWidget, phone, referralCode) => {
    const res = await authApi.verifyWidgetToken(accessTokenFromWidget, phone, referralCode);
    const { accessToken, user: userData, referralApplied } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(userData);
    return { user: userData, referralApplied: referralApplied || null };
  }, []);

  const register = useCallback(async ({ fullName, email, phone, password, referralCode }) => {
    const res = await authApi.register({
      fullName,
      email,
      phone,
      password,
      ...(referralCode ? { referralCode } : {}),
    });
    const { accessToken, user: userData, referralApplied } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(userData);
    // Return both the user and the referral apply result so callers can show feedback
    return { user: userData, referralApplied: referralApplied || null };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if API call fails
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await userApi.getProfile();
      setUser(data.user || data);
    } catch {
      // Silent fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        sendOtp,
        login,
        loginWithWidgetToken,
        loginWithPassword,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
