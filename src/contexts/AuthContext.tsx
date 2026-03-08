import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "elder" | "caretaker" | "ngo" | "orphan";

export interface ActivityLog {
  action: string;
  timestamp: string;
  device?: string;
  ip?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  type: string;
  description: string;
  status: "given" | "withdrawn";
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "pending" | "approved" | "rejected";
  activityLog: ActivityLog[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => User | null;
  register: (name: string, email: string, password: string, role: Role) => User;
  logout: () => void;
  verifyOTP: () => void;
  isOTPVerified: boolean;
  addConsentRecord: (type: string, description: string, status: "given" | "withdrawn") => void;
  getConsentHistory: (userId?: string) => ConsentRecord[];
}

const USERS_KEY = "careconnect_users";
const USER_KEY = "careconnect_user";
const CONSENT_KEY = "careconnect_consent_history";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    const otpVerified = localStorage.getItem("careconnect_otp_verified");
    if (stored) setUser(JSON.parse(stored));
    if (otpVerified === "true") setIsOTPVerified(true);
  }, []);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx >= 0) users[idx] = u;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = (name: string, email: string, password: string, role: Role): User => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      status: role === "admin" ? "approved" : "pending",
      activityLog: [{ action: "Account created", timestamp: new Date().toISOString() }],
    };

    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const creds = JSON.parse(localStorage.getItem("careconnect_creds") || "{}");
    creds[email] = { password, userId: newUser.id };
    localStorage.setItem("careconnect_creds", JSON.stringify(creds));
    
    setUser(newUser);
    setIsOTPVerified(false);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.removeItem("careconnect_otp_verified");
    return newUser;
  };

  const login = (email: string, password: string): User | null => {
    const creds = JSON.parse(localStorage.getItem("careconnect_creds") || "{}");
    if (creds[email] && creds[email].password === password) {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const found = users.find((u) => u.id === creds[email].userId);
      if (found) {
        setUser(found);
        setIsOTPVerified(false);
        localStorage.setItem(USER_KEY, JSON.stringify(found));
        localStorage.removeItem("careconnect_otp_verified");
        return found;
      }
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setIsOTPVerified(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("careconnect_user");
    localStorage.removeItem("careconnect_otp_verified");
  };

  const verifyOTP = () => {
    setIsOTPVerified(true);
    localStorage.setItem("careconnect_otp_verified", "true");
    if (user) {
      const updatedUser = {
        ...user,
        activityLog: [
          ...(user.activityLog || []),
          { action: "OTP verified", timestamp: new Date().toISOString() },
        ],
      };
      persistUser(updatedUser);
    }
  };

  // --- NEW FUNCTIONS TO FIX RED ERRORS ---
  const addConsentRecord = (type: string, description: string, status: "given" | "withdrawn") => {
    if (!user) return;
    const history: ConsentRecord[] = JSON.parse(localStorage.getItem(CONSENT_KEY) || "[]");
    const newRecord: ConsentRecord = {
      id: Date.now().toString(),
      userId: user.id,
      type,
      description,
      status,
      timestamp: new Date().toISOString()
    };
    history.push(newRecord);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(history));
  };

  const getConsentHistory = (userId?: string): ConsentRecord[] => {
    const history: ConsentRecord[] = JSON.parse(localStorage.getItem(CONSENT_KEY) || "[]");
    const targetId = userId || user?.id;
    return history.filter(record => record.userId === targetId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, verifyOTP, isOTPVerified, 
      addConsentRecord, getConsentHistory 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}