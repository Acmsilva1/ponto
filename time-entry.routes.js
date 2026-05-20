import { TimeEntryController } from "./time-entry.controller.js";

export function registerTimeEntriesRoutes(router, prefix, container) {
  const controller = new TimeEntryController(container);

  router.register("POST", `${prefix}/time-entries`, controller.create.bind(controller));
  router.register(
    "GET",
    `${prefix}/employees/:employeeId/time-entries`,
    controller.listByEmployeeId.bind(controller)
  );
}
