import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken ? savedToken : null;
  });

  const [monitors, setMonitors] = useState(() => {
    const savedMonitors = localStorage.getItem("monitors");
    return savedMonitors ? JSON.parse(savedMonitors) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (monitors) localStorage.setItem("monitors", JSON.stringify(monitors));
    else localStorage.removeItem("monitors");
  }, [token]);
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("monitors");
  };
  
  return (
    <AuthContext.Provider value={{ 
      user,
      setUser,
      token,
      setToken,
      monitors,
      setMonitors,
      logout,
      isAuthenticated: !!user && !!token
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);