import { financeService } from "./financeService.js";

export const budgetService = {
  list: financeService.budgets,
  save: financeService.saveBudget,
  remove: financeService.deleteBudget,
};