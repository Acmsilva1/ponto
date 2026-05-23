import { Employee, TimeEntry } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Ana Silva',
    role: 'Product Designer',
    department: 'Tecnologia',
    workHoursPerDay: 8,
    avatarColor: 'bg-indigo-600',
    registryId: 'REG-10492'
  },
  {
    id: 'emp-2',
    name: 'Carlos Souza',
    role: 'Desenvolvedor Fullstack',
    department: 'Engenharia',
    workHoursPerDay: 8,
    avatarColor: 'bg-emerald-600',
    registryId: 'REG-10521'
  },
  {
    id: 'emp-3',
    name: 'Mariana Costa',
    role: 'Gerente de Contas',
    department: 'Vendas',
    workHoursPerDay: 8,
    avatarColor: 'bg-amber-600',
    registryId: 'REG-09848'
  },
  {
    id: 'emp-4',
    name: 'Juliano Reis',
    role: 'Suporte Técnico',
    department: 'Atendimento',
    workHoursPerDay: 6,
    avatarColor: 'bg-rose-500',
    registryId: 'REG-11004'
  }
];

// Helper to generate a timestamp on a specific day
function makeTime(day: string, hourStr: string): string {
  return `2026-05-${day}T${hourStr}:00.000Z`;
}

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  // --- Ana Silva (emp-1) ---
  // May 18 (Perfect day: 8 hours worked, 1 hour lunch)
  {
    id: 'entry-1',
    employeeId: 'emp-1',
    timestamp: makeTime('18', '08:02'),
    type: 'entrada',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },
  {
    id: 'entry-2',
    employeeId: 'emp-1',
    timestamp: makeTime('18', '12:05'),
    type: 'almoco_saida',
    location: { latitude: -23.55102, longitude: -46.63412, accuracy: 24, description: "Próximo à Sede" }
  },
  {
    id: 'entry-3',
    employeeId: 'emp-1',
    timestamp: makeTime('18', '13:05'),
    type: 'almoco_retorno',
    location: { latitude: -23.55050, longitude: -46.633320, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-4',
    employeeId: 'emp-1',
    timestamp: makeTime('18', '17:02'),
    type: 'saida',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },

  // May 19 (Overtime: worked until 18h15, quick lunch)
  {
    id: 'entry-5',
    employeeId: 'emp-1',
    timestamp: makeTime('19', '07:55'),
    type: 'entrada',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 15, description: "Sede São Paulo" }
  },
  {
    id: 'entry-6',
    employeeId: 'emp-1',
    timestamp: makeTime('19', '12:00'),
    type: 'almoco_saida',
    location: { latitude: -23.55051, longitude: -46.633310, accuracy: 11, description: "Sede São Paulo" }
  },
  {
    id: 'entry-7',
    employeeId: 'emp-1',
    timestamp: makeTime('19', '12:45'),
    type: 'almoco_retorno',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-8',
    employeeId: 'emp-1',
    timestamp: makeTime('19', '18:15'),
    type: 'saida',
    location: { latitude: -23.54890, longitude: -46.631200, accuracy: 35, description: "Estação do Metrô" }
  },

  // May 20 (Home office, manual correction, forgot lunch returning point)
  {
    id: 'entry-9',
    employeeId: 'emp-1',
    timestamp: makeTime('20', '09:00'),
    type: 'entrada',
    isManual: true,
    justification: "Iniciei remoto, esqueci de bater no início",
    location: { latitude: -23.59000, longitude: -46.671000, accuracy: 50, description: "Residencial (Remoto)" }
  },
  {
    id: 'entry-10',
    employeeId: 'emp-1',
    timestamp: makeTime('20', '13:00'),
    type: 'almoco_saida',
    location: { latitude: -23.59002, longitude: -46.671001, accuracy: 40, description: "Residencial (Remoto)" }
  },
  {
    id: 'entry-11',
    employeeId: 'emp-1',
    timestamp: makeTime('20', '14:00'),
    type: 'almoco_retorno',
    isManual: true,
    justification: "Esqueci de registrar o retorno do almoço",
    location: { latitude: -23.59000, longitude: -46.671000, accuracy: 50, description: "Residencial (Remoto)" }
  },
  {
    id: 'entry-12',
    employeeId: 'emp-1',
    timestamp: makeTime('20', '18:00'),
    type: 'saida',
    location: { latitude: -23.59005, longitude: -46.671004, accuracy: 45, description: "Residencial (Remoto)" }
  },

  // May 21 (Missing exit punch - alert warning)
  {
    id: 'entry-13',
    employeeId: 'emp-1',
    timestamp: makeTime('21', '08:00'),
    type: 'entrada',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },
  {
    id: 'entry-14',
    employeeId: 'emp-1',
    timestamp: makeTime('21', '12:00'),
    type: 'almoco_saida',
    location: { latitude: -23.55102, longitude: -46.63412, accuracy: 22, description: "Próximo à Sede" }
  },
  {
    id: 'entry-15',
    employeeId: 'emp-1',
    timestamp: makeTime('21', '13:00'),
    type: 'almoco_retorno',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },
  // Saída is missing on May 21! That triggers an alert message.

  // May 22 (Normal day)
  {
    id: 'entry-16',
    employeeId: 'emp-1',
    timestamp: makeTime('22', '08:05'),
    type: 'entrada',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },
  {
    id: 'entry-17',
    employeeId: 'emp-1',
    timestamp: makeTime('22', '12:00'),
    type: 'almoco_saida',
    location: { latitude: -23.55102, longitude: -46.63412, accuracy: 22, description: "Próximo à Sede" }
  },
  {
    id: 'entry-18',
    employeeId: 'emp-1',
    timestamp: makeTime('22', '13:00'),
    type: 'almoco_retorno',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },
  {
    id: 'entry-19',
    employeeId: 'emp-1',
    timestamp: makeTime('22', '17:05'),
    type: 'saida',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 12, description: "Sede São Paulo" }
  },

  // --- Carlos Reis (emp-2) ---
  {
    id: 'entry-c1',
    employeeId: 'emp-2',
    timestamp: makeTime('18', '09:00'),
    type: 'entrada',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c2',
    employeeId: 'emp-2',
    timestamp: makeTime('18', '13:00'),
    type: 'almoco_saida',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c3',
    employeeId: 'emp-2',
    timestamp: makeTime('18', '14:00'),
    type: 'almoco_retorno',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c4',
    employeeId: 'emp-2',
    timestamp: makeTime('18', '18:00'),
    type: 'saida',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c5',
    employeeId: 'emp-2',
    timestamp: makeTime('19', '08:50'),
    type: 'entrada',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c6',
    employeeId: 'emp-2',
    timestamp: makeTime('19', '12:50'),
    type: 'almoco_saida',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c7',
    employeeId: 'emp-2',
    timestamp: makeTime('19', '13:50'),
    type: 'almoco_retorno',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  },
  {
    id: 'entry-c8',
    employeeId: 'emp-2',
    timestamp: makeTime('19', '17:50'),
    type: 'saida',
    location: { latitude: -23.55052, longitude: -46.633308, accuracy: 10, description: "Sede São Paulo" }
  }
];

export function getInitialState() {
  const storedEntries = localStorage.getItem('ponto_time_entries');
  const storedEmployees = localStorage.getItem('ponto_employees');

  let employees = INITIAL_EMPLOYEES;
  if (storedEmployees) {
    try {
      employees = JSON.parse(storedEmployees);
    } catch (e) {
      employees = INITIAL_EMPLOYEES;
    }
  } else {
    localStorage.setItem('ponto_employees', JSON.stringify(INITIAL_EMPLOYEES));
  }

  let entries = INITIAL_TIME_ENTRIES;
  if (storedEntries) {
    try {
      entries = JSON.parse(storedEntries);
    } catch (e) {
      entries = INITIAL_TIME_ENTRIES;
    }
  } else {
    localStorage.setItem('ponto_time_entries', JSON.stringify(INITIAL_TIME_ENTRIES));
  }

  return { employees, entries };
}

export function saveEntries(entries: TimeEntry[]) {
  localStorage.setItem('ponto_time_entries', JSON.stringify(entries));
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem('ponto_employees', JSON.stringify(employees));
}
