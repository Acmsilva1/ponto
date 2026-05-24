import { Employee, TimeEntry } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [];

export function getInitialState() {
  return { employees: INITIAL_EMPLOYEES, entries: INITIAL_TIME_ENTRIES };
}

export function saveEntries(entries: TimeEntry[]) {
  void entries;
}

export function saveEmployees(employees: Employee[]) {
  void employees;
}
