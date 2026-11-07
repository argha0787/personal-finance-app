import { apiRequest } from "./api.js";

export const authService = {
  me: () => apiRequest("/auth/me"),
  login: (email, password) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name, email, password) =>
    apiRequest("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};