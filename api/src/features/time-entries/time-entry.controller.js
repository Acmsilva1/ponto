import { json } from "../../shared/http/json.js";
import { readJsonBody } from "../../shared/http/read-json-body.js";
import { validateCreateTimeEntry, validateEmployeeIdParams } from "./time-entry.schema.js";
import { TimeEntryService } from "./time-entry.service.js";
import { ListTimeEntriesUseCase } from "./use-cases/list-time-entries.use-case.js";
import { RegisterTimeEntryUseCase } from "./use-cases/register-time-entry.use-case.js";

export class TimeEntryController {
  constructor(container) {
    this.container = container;
  }

  async create({ req, res, context }) {
    const input = validateCreateTimeEntry(await readJsonBody(req));
    const service = new TimeEntryService(this.container.repositories.timeEntries);
    const useCase = new RegisterTimeEntryUseCase(service);
    const createdEntry = await useCase.execute(input, context);

    json(res, 201, {
      data: createdEntry
    });
  }

  async listByEmployeeId({ res, params }) {
    const parsedParams = validateEmployeeIdParams(params);
    const service = new TimeEntryService(this.container.repositories.timeEntries);
    const useCase = new ListTimeEntriesUseCase(service);
    const entries = await useCase.execute(parsedParams.employeeId);

    json(res, 200, {
      data: entries
    });
  }
}
