import { createContext, useContext } from "react";

export type Role = "buyer" | "manager" | "admin";

export type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  email_confirmed: boolean;
};

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "Покупець",
  manager: "Менеджер магазину",
  admin: "Адміністратор",
};

export type LoginResult = { ok: true } | { ok: false; message: string; code?: string };

export type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<LoginResult>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth потрібно викликати всередині AuthProvider");
  return value;
}
