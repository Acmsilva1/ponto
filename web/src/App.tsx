import { useEffect, useState } from 'react';
import type { Employee, Justification, TimeEntry, DashboardSummary } from '@shared/contracts';
import { LoginPage } from './features/auth/pages/LoginPage.js';
import { DashboardPage } from './features/dashboard/pages/DashboardPage.js';
import { ProfilePage } from './features/settings/profile/pages/ProfilePage.js';
import { apiRequest } from './lib/apiClient.js';
import { me, logout } from './features/auth/services/authService.js';
import { listEmployees } from './features/employees/services/employeesService.js';
import { listTimeEntries } from './features/time-entries/services/timeEntriesService.js';
import { listJustifications } from './features/justifications/services/justificationsService.js';
import { loadDashboardSummary } from './features/dashboard/services/dashboardService.js';

export default function App() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [screen, setScreen] = useState<'dashboard' | 'profile'>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    employeesCount: 0,
    timeEntriesCount: 0,
    justificationsCount: 0,
    pendingJustificationsCount: 0,
    todayEntriesCount: 0
  });
  const [apiStatus, setApiStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  async function refreshData(role: Employee['accessRole'] = currentEmployee?.accessRole || 'colaborador') {
    const tasks = [
      role === 'gestor'
        ? listEmployees()
        : Promise.resolve<{ employees: Employee[] }>({ employees: [] }),
      listTimeEntries(),
      listJustifications(),
      loadDashboardSummary()
    ] as const;

    const [employeesResult, timeEntriesResult, justificationsResult, summaryResult] = await Promise.all(tasks);

    setEmployees(employeesResult.employees);
    setTimeEntries(timeEntriesResult.timeEntries);
    setJustifications(justificationsResult.justifications);
    setSummary(summaryResult.summary);
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        await apiRequest('/health');
        setApiStatus('connected');
      } catch {
        setApiStatus('error');
        return;
      }

      try {
        const current = await me();
        setCurrentEmployee(current.employee);
        setScreen(current.employee.mustChangePassword ? 'profile' : 'dashboard');
        await refreshData(current.employee.accessRole);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (
          message.includes('Autenticação obrigatória') ||
          message.includes('Sessão inválida') ||
          message.includes('Usuário não encontrado')
        ) {
          setCurrentEmployee(null);
          return;
        }
        setApiStatus('error');
      }
    }

    bootstrap();
  }, []);

  async function handleLogin(employee: Employee) {
    setCurrentEmployee(employee);
    setScreen(employee.mustChangePassword ? 'profile' : 'dashboard');
    await refreshData(employee.accessRole);
  }

  async function handleRegister(employee: Employee) {
    setCurrentEmployee(employee);
    setScreen(employee.mustChangePassword ? 'profile' : 'dashboard');
    await refreshData(employee.accessRole);
  }

  async function handleLogout() {
    await logout();
    setCurrentEmployee(null);
    setEmployees([]);
    setTimeEntries([]);
    setJustifications([]);
    setApiStatus('connected');
    setScreen('dashboard');
  }

  async function handleProfileUpdated(employee: Employee) {
    setCurrentEmployee(employee);
    setScreen('dashboard');
    await refreshData(employee.accessRole);
  }

  if (!currentEmployee) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} apiStatus={apiStatus} />;
  }

  if (screen === 'profile') {
    return (
      <ProfilePage
        employee={currentEmployee}
        onBackToDashboard={() => setScreen('dashboard')}
        onLogout={handleLogout}
        onProfileUpdated={handleProfileUpdated}
      />
    );
  }

  return (
    <DashboardPage
      employee={currentEmployee}
      employees={employees}
      timeEntries={timeEntries}
      justifications={justifications}
      summary={summary}
      onRefresh={refreshData}
      onLogout={handleLogout}
      onOpenProfile={() => setScreen('profile')}
    />
  );
}
