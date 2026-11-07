import { financeService } from "./financeService.js";

export const transactionService = {
  list: financeService.transactions,
  create: financeService.createTransaction,
  update: financeService.updateTransaction,
  remove: financeService.deleteTransaction,
};