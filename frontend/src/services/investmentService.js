import { financeService } from "./financeService.js";

export const investmentService = {
  list: () => financeService.records("investments"),
  create: (payload) => financeService.createRecord("investments", payload),
  update: (id, payload) => financeService.updateRecord("investments", id, payload),
  remove: (id) => financeService.deleteRecord("investments", id),
};