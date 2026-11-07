import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "../services/api.js";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setUser(await authService.me());
      setError("");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setUser(null);
        setError("");
      } else {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const signedInUser = await authService.login(email, password);
    setUser(signedInUser);
    setError("");
    return signedInUser;
  };
  const register = async (name, email, password) => {
    const registeredUser = await authService.register(name, email, password);
    setUser(registeredUser);
    setError("");
    return registeredUser;
  };
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  const updateUser = (changes) => setUser((current) => current ? { ...current, ...changes } : current);

  const value = useMemo(() => ({ user, loading, error, login, register, logout, refresh, updateUser }), [user, loading, error, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}