import { apiUrl } from "./api.js";

export const reportService = {
  transactionsCsvUrl: () => apiUrl("/reports/transactions.csv"),
};