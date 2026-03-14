// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const BASE = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("fathom_token"));
  const [loading, setLoading] = useState(true);

  // On app start: silently verify stored token
  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const res  = await fetch(`${BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem("fathom_token");
            setToken(null);
          }
        } catch {
          localStorage.removeItem("fathom_token");
          setToken(null);
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res  = await fetch(`${BASE}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed.");
    localStorage.setItem("fathom_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const res  = await fetch(`${BASE}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Registration failed.");
    localStorage.setItem("fathom_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fathom_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};