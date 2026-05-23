import { Employee, TimeEntry } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [];

export function getInitialState() {
  const storedEntries = localStorage.getItem('ponto_digital_real_time_entries_v1');
  const storedEmployees = localStorage.getItem('ponto_digital_real_employees_v1');

  let employees = INITIAL_EMPLOYEES;
  if (storedEmployees) {
    try {
      employees = JSON.parse(storedEmployees);
    } catch (e) {
      employees = INITIAL_EMPLOYEES;
    }
  } else {
    localStorage.setItem('ponto_digital_real_employees_v1', JSON.stringify(INITIAL_EMPLOYEES));
  }

  let entries = INITIAL_TIME_ENTRIES;
  if (storedEntries) {
    try {
      entries = JSON.parse(storedEntries);
    } catch (e) {
      entries = INITIAL_TIME_ENTRIES;
    }
  } else {
    localStorage.setItem('ponto_digital_real_time_entries_v1', JSON.stringify(INITIAL_TIME_ENTRIES));
  }

  return { employees, entries };
}

export function saveEntries(entries: TimeEntry[]) {
  localStorage.setItem('ponto_digital_real_time_entries_v1', JSON.stringify(entries));
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem('ponto_digital_real_employees_v1', JSON.stringify(employees));
}
