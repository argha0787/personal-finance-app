import { apiRequest } from "./api.js";

export const financeService = {
  dashboard: (period = "this_month") => apiRequest(`/dashboard?period=${encodeURIComponent(period)}`),
  accounts: () => apiRequest("/accounts"),
  createAccount: (payload) => apiRequest("/accounts", { method: "POST", body: JSON.stringify(payload) }),
  updateAccount: (id, payload) => apiRequest(`/accounts/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAccount: (id) => apiRequest(`/accounts/${id}`, { method: "DELETE" }),
  transactions: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value));
    return apiRequest(`/transactions${query.size ? `?${query}` : ""}`);
  },
  createTransaction: (payload) => apiRequest("/transactions", { method: "POST", body: JSON.stringify(payload) }),
  updateTransaction: (id, payload) => apiRequest(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTransaction: (id) => apiRequest(`/transactions/${id}`, { method: "DELETE" }),
  budgets: () => apiRequest("/budgets"),
  saveBudget: (payload) => apiRequest("/budgets", { method: "POST", body: JSON.stringify(payload) }),
  deleteBudget: (id) => apiRequest(`/budgets/${id}`, { method: "DELETE" }),
  records: (kind) => apiRequest(`/records/${kind}`),
  createRecord: (kind, payload) => apiRequest(`/records/${kind}`, { method: "POST", body: JSON.stringify(payload) }),
  updateRecord: (kind, id, payload) => apiRequest(`/records/${kind}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteRecord: (kind, id) => apiRequest(`/records/${kind}/${id}`, { method: "DELETE" }),
  updatePreferences: (payload) => apiRequest("/users/me", { method: "PATCH", body: JSON.stringify(payload) }),
  askAi: (question) => apiRequest("/ai/ask", { method: "POST", body: JSON.stringify({ question }) }),
  calculateEmi: (payload) => apiRequest("/calculators/emi", { method: "POST", body: JSON.stringify(payload) }),
};
