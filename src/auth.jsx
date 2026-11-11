import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "./api";

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || "",
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  function logout() {
    sessionStorage.removeItem("token");
    setToken("");
    setUser(null);
  }
  function login(session) {
    sessionStorage.setItem("token", session.token);
    setToken(session.token);
    setUser(session.user);
  }
  useEffect(() => {
    window.addEventListener("session-expired", logout);
    return () => window.removeEventListener("session-expired", logout);
  }, []);
  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setLoading(false);
      return;
    }
    api("/auth/me", { token })
      .then((profile) => {
        if (isMounted) setUser(profile);
      })
      .catch(() => {
        if (isMounted) logout();
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [token]);
  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export function ProtectedRoute({ admin = false }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <p role="status">Loading session…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/notes" replace />;
  return <Outlet />;
}
