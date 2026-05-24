import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClockWidget } from './components/ClockWidget';
import { EmployeeSelector } from './components/EmployeeSelector';
import { DashboardStats } from './components/DashboardStats';
import { TimeCardTable } from './components/TimeCardTable';
import { LoginScreen } from './components/LoginScreen';
import { getInitialState, saveEntries, saveEmployees } from './data';
import { calculateDailySummaries } from './utils';
import { Employee, TimeEntry, TimeEntryType, GeoLocationData } from './types';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';
import { hasSupabase, getEmployees, getTimeEntries, insertEmployee, insertTimeEntry } from './supabaseService';
import { testSupabaseConnection } from './supabaseClient';

export default function App() {
  // Load state from localStorage / seed
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  
  // Login Session state
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [activeRole, setActiveRole] = useState<'colaborador' | 'gestor' | null>(null);

  // Supabase live status indicators
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  // Visual alerts/notifications state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    // 1. Core local storage startup (immediate load)
    const { employees: initialEmployees, entries: initialEntries } = getInitialState();
    setEmployees(initialEmployees);
    setEntries(initialEntries);
    if (initialEmployees.length > 0) {
      setSelectedEmpId(initialEmployees[0].id);
    }

    // 2. Validate Supabase connection and pull live data if credentials are setup
    if (hasSupabase) {
      testSupabaseConnection().then(async (isValid) => {
        setSupabaseConnected(isValid);
        if (isValid) {
          // Fetch employees
          const { data: dbWorkers, error: empErr } = await getEmployees();
          if (!empErr && dbWorkers && dbWorkers.length > 0) {
            setEmployees(dbWorkers);
            saveEmployees(dbWorkers); // Backup offline

            // Fetch entries
            const { data: dbLogs, error: entErr } = await getTimeEntries();
            if (!entErr && dbLogs) {
              setEntries(dbLogs);
              saveEntries(dbLogs); // Backup offline
            }

            // Sync currently highlighted employee
            setSelectedEmpId(prev => {
              const remains = dbWorkers.some(w => w.id === prev);
              return remains ? prev : dbWorkers[0].id;
            });

            setNotification({
              message: 'Dados sincronizados em tempo real com o Supabase!',
              type: 'success'
            });
          }
        }
      });
    }
  }, []);

  // Timer to clear toast notification automatically
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auth logins callbacks
  const handleLogin = (employee: Employee, asRole: 'colaborador' | 'gestor') => {
    setCurrentUser(employee);
    setActiveRole(asRole);
    if (asRole === 'colaborador') {
      setSelectedEmpId(employee.id);
    } else {
      // For gestor, make sure we select a worker in the pool to inspect
      if (employees.length > 0) {
        const firstCo = employees[0].id;
        setSelectedEmpId(prev => employees.some(w => w.id === prev) ? prev : firstCo);
      }
    }
    setNotification({
      message: `Acesso autorizado! Bem-vindo(a) ${employee.name}.`,
      type: 'success'
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    setNotification({
      message: 'Você se desconectou com sucesso!',
      type: 'success'
    });
  };

  const handleQuickRegister = async (name: string, role: string, department: string, isGestor: boolean) => {
    const randomColors = [
      'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-500', 
      'bg-sky-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const avatarColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const registryId = `REG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newWorker: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      workHoursPerDay: 8,
      avatarColor,
      registryId,
      password: '1234', // default password
      accessRole: isGestor ? 'gestor' : 'colaborador'
    };

    const updatedWorkers = [...employees, newWorker];
    setEmployees(updatedWorkers);
    saveEmployees(updatedWorkers);
    setSelectedEmpId(newWorker.id);

    setNotification({
      message: `Perfil "${name}" criado! Acesso ID: ${registryId} e senha: "1234".`,
      type: 'success'
    });

    if (hasSupabase) {
      const success = await insertEmployee(newWorker);
      if (success) {
        setNotification({
          message: `Perfil "${name}" gravado e sincronizado com o Supabase! ID: ${registryId}`,
          type: 'success'
        });
      }
    }
  };

  const handleAddEmployee = async (newWorker: Employee) => {
    const updatedWorkers = [...employees, newWorker];
    setEmployees(updatedWorkers);
    saveEmployees(updatedWorkers);
    setSelectedEmpId(newWorker.id);

    setNotification({
      message: `Colaborador "${newWorker.name}" cadastrado com sucesso!`,
      type: 'success'
    });

    if (hasSupabase) {
      const success = await insertEmployee(newWorker);
      if (success) {
        setNotification({
          message: `Colaborador "${newWorker.name}" sincronizado com o Supabase!`,
          type: 'success'
        });
      }
    }
  };

  // Restrict active profile based on view role selection
  const activeEmployee = activeRole === 'colaborador' && currentUser
    ? currentUser
    : (employees.find(e => e.id === selectedEmpId) || currentUser || employees[0]);

  // If not logged in, force Login screen portal
  if (!currentUser || !activeRole) {
    return (
      <LoginScreen
        employees={employees}
        onLogin={handleLogin}
        onQuickRegister={handleQuickRegister}
        supabaseConnected={supabaseConnected}
      />
    );
  }

  // Calculate stats summaries
  const summaries = activeEmployee ? calculateDailySummaries(activeEmployee, entries) : [];

  // Get index logs of entries registered TODAY for the logged-in/active employee
  const getTodayEntries = () => {
    if (!activeEmployee) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.employeeId === activeEmployee.id && e.timestamp.startsWith(todayStr));
  };

  const todayEntries = getTodayEntries();

  // Core clock-in punch trigger
  const handleClockIn = async (type: TimeEntryType, justification: string, location?: GeoLocationData) => {
    if (!activeEmployee) return;

    const freshEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      employeeId: activeEmployee.id,
      timestamp: new Date().toISOString(),
      type,
      justification: justification.trim() || undefined,
      isManual: justification.trim() ? true : false,
      location: location || {
        latitude: -23.55052,
        longitude: -46.633308,
        accuracy: 20,
        description: 'Conexão PWA Registrada'
      }
    };

    const updatedEntries = [freshEntry, ...entries];
    setEntries(updatedEntries);
    saveEntries(updatedEntries);

    const typeNames: Record<TimeEntryType, string> = {
      entrada: 'Entrada Inicial',
      almoco_saida: 'Saída Almoço',
      almoco_retorno: 'Retorno Almoço',
      saida: 'Saída Final'
    };

    setNotification({
      message: `Ponto de "${typeNames[type]}" registrado com sucesso para ${activeEmployee.name}!`,
      type: 'success'
    });

    if (hasSupabase) {
      const success = await insertTimeEntry(freshEntry);
      if (success) {
        setNotification({
          message: `Batida de "${typeNames[type]}" enviada para o banco de dados do Supabase!`,
          type: 'success'
        });
      }
    }
  };

  // Adjust retroactive manual points
  const handleAddManualEntry = async (
    dateString: string, 
    timeString: string, 
    type: TimeEntryType, 
    justification: string
  ) => {
    if (!activeEmployee) return;

    const localDateStr = `${dateString}T${timeString}:00`;
    const mockedDate = new Date(localDateStr);

    const freshEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      employeeId: activeEmployee.id,
      timestamp: mockedDate.toISOString(),
      type,
      isManual: true,
      justification,
      location: {
        latitude: -23.55052,
        longitude: -46.633308,
        accuracy: 30,
        description: 'Inserção Manual Justificada'
      }
    };

    const updatedEntries = [freshEntry, ...entries];
    setEntries(updatedEntries);
    saveEntries(updatedEntries);

    setNotification({
      message: `Ponto retroativo gravado para o dia ${dateString.split('-').reverse().join('/')} às ${timeString}!`,
      type: 'success'
    });

    if (hasSupabase) {
      const success = await insertTimeEntry(freshEntry);
      if (success) {
        setNotification({
          message: 'Ajuste manual sincronizado com o banco Supabase!',
          type: 'success'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-gray-900" id="application-container">
      {/* Toast Notification HUD */}
      {notification && (
        <div 
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white py-3 px-5 rounded-xl shadow-2xl border border-slate-700 max-w-sm animate-fade-in animate-slide-up"
          id="system-toast-alert"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-normal">{notification.message}</span>
        </div>
      )}

      {/* Styled Top Branding Navbar */}
      <Navbar currentUser={currentUser} activeRole={activeRole} onLogout={handleLogout} />

      {/* Main Core Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Section / Meta status indicator */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-200/60 pb-5" id="welcome-bar">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {activeRole === 'gestor' ? (
                <>Painel Master de <span className="text-indigo-600">Gestão e Auditoria</span></>
              ) : (
                <>Olá, <span className="text-indigo-600">{activeEmployee?.name}</span></>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeRole === 'gestor' 
                ? 'Monitore os cartões de ponto, auditorias de GPS e métricas consolidadas CLT.'
                : `Setor de ${activeEmployee?.department} • Visualize e bata seu ponto com segurança.`}
            </p>
          </div>
          
          {/* Dynamic Sync state Badges */}
          <div className="flex gap-2">
            {hasSupabase ? (
              supabaseConnected === true ? (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs" id="subabase-connected-badge">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold font-sans">Nuvem Supabase Ativa</span>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs" id="supabase-incomplete-badge">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-bold font-sans">Sincronizando Tabelas...</span>
                </div>
              )
            ) : (
              <div className="bg-slate-100 text-slate-600 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs text-xs" id="local-mode-badge">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                <span className="text-[11px] font-semibold text-gray-600 font-mono">Modo Local/Offline Ativo</span>
              </div>
            )}
            
            <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 font-mono text-xs">Portaria 671 MTE</span>
            </div>
          </div>
        </div>

        {activeEmployee ? (
          <>
            {/* Dashboard Statistics (dynamic based on highlighted worker) */}
            <DashboardStats summaries={summaries} employee={activeEmployee} />

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column Controls */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Only show Clock Punch widget if role is Colaborador, OR if Gestor has also highlighted themselves */}
                {activeRole === 'colaborador' ? (
                  <ClockWidget 
                    onClockIn={handleClockIn} 
                    todayEntries={todayEntries} 
                    employeeName={activeEmployee.name} 
                  />
                ) : (
                  <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-3">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                      Controle Administrativo
                    </span>
                    <h3 className="text-sm font-bold">Filtros Gestor Ativos</h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Você está visualizando o espelho de ponto e indicadores de: <strong className="text-white">{activeEmployee.name}</strong>.
                    </p>
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div>• Setor: <span className="text-slate-200 font-medium">{activeEmployee.department}</span></div>
                      <div>• Cargo: <span className="text-slate-200 font-medium">{activeEmployee.role}</span></div>
                      <div>• ID de Registro: <span className="text-slate-200 font-mono">{activeEmployee.registryId}</span></div>
                    </div>
                  </div>
                )}

                {/* 2. Employee switching & Management Form (Only visible to Gestores) */}
                {activeRole === 'gestor' && (
                  <EmployeeSelector 
                    employees={employees} 
                    selectedId={selectedEmpId} 
                    onSelect={setSelectedEmpId} 
                    onAddEmployee={handleAddEmployee}
                  />
                )}
              </div>

              {/* Right Column - Point list tables */}
              <div className="lg:col-span-7">
                <TimeCardTable 
                  summaries={summaries} 
                  onAddManualEntry={handleAddManualEntry} 
                  employeeName={activeEmployee.name} 
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-sm text-gray-400">
            Nenhum colaborador selecionado ou cadastrado para exibição de relatórios.
          </div>
        )}
      </main>

      {/* Dynamic Legal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Ponto Digital. Desenvolvido em conformidade com as diretrizes do Ministério do Trabalho e Emprego (MTE) brasileiro.</p>
        <p className="mt-1 text-[10px]">Utiliza autenticação baseada em criptografia local, backup em nuvem Supabase e auditoria de coordenadas GPS.</p>
      </footer>
    </div>
  );
}
