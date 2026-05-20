const API_BASE_URL = localStorage.getItem('nexus-api-url') || 'http://localhost:3001/api';
const DEFAULT_EMPLOYEE_ID = localStorage.getItem('nexus-employee-id') || 'emp_demo_001';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || 'Erro inesperado na API';
    throw new Error(message);
  }

  return payload.data;
}

async function registerTimeEntry({ employeeId, type, occurredAt }) {
  return request('/time-entries', {
    method: 'POST',
    body: JSON.stringify({ employeeId, type, occurredAt })
  });
}

async function listTimeEntries(employeeId = DEFAULT_EMPLOYEE_ID) {
  return request(`/employees/${encodeURIComponent(employeeId)}/time-entries`);
}

window.NexusTimeApi = {
  API_BASE_URL,
  DEFAULT_EMPLOYEE_ID,
  registerTimeEntry,
  listTimeEntries
};
