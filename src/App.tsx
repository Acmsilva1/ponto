import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ClockWidget } from './components/ClockWidget';
import { EmployeeSelector } from './components/EmployeeSelector';
import { DashboardStats } from './components/DashboardStats';
import { TimeCardTable } from './components/TimeCardTable';
import { getInitialState, saveEntries, saveEmployees } from './data';
import { calculateDailySummaries } from './utils';
import { Employee, TimeEntry, TimeEntryType, GeoLocationData } from './types';
import { AlertCircle, CheckCircle, HelpCircle, FileText, X, Database } from 'lucide-react';
import { hasSupabase, getEmployees, getTimeEntries, insertEmployee, insertTimeEntry } from './supabaseService';
import { testSupabaseConnection } from './supabaseClient';

export default function App() {
  // Load state from localStorage / seed
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  
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
              message: 'Dados sicronizados em tempo real com o Supabase!',
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

  const handleAddEmployee = async (newWorker: Employee) => {
    const updatedWorkers = [...employees, newWorker];
    setEmployees(updatedWorkers);
    saveEmployees(updatedWorkers);
    
    // Auto-focus on new profile to facilitate testing
    setSelectedEmpId(newWorker.id);

    setNotification({
      message: `Colaborador "${newWorker.name}" criado com sucesso!`,
      type: 'success'
    });

    // Synergize live to Supabase if active
    if (hasSupabase) {
      const success = await insertEmployee(newWorker);
      if (success) {
        setNotification({
          message: `Colaborador "${newWorker.name}" salvo no Supabase!`,
          type: 'success'
        });
      }
    }
  };

  const activeEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  if (!activeEmployee) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-gray-100 antialiased" id="onboarding-root">
        {/* Navbar */}
        <Navbar />

        {/* Welcome Onboarding Box */}
        <div className="flex-1 max-w-lg w-full mx-auto px-4 flex flex-col justify-center py-12">
          {notification && (
            <div className="mb-4 bg-emerald-600 text-white py-3 px-4 rounded-xl text-center text-xs font-semibold shadow-lg">
              {notification.message}
            </div>
          )}
          
          <div className="bg-white text-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-4 shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-gray-950">Seu Ponto Digital está pronto!</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Tudo configurado com sucesso e limpo para uso real. Registre o primeiro colaborador para iniciar os registros de batidas no sistema.
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Render the Employee selector specifically focusing on addition form */}
            <div className="text-left">
              <EmployeeSelector 
                employees={employees} 
                selectedId={selectedEmpId} 
                onSelect={setSelectedEmpId} 
                onAddEmployee={handleAddEmployee}
              />
            </div>
          </div>
        </div>

        <footer className="py-6 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Ponto Digital. Sem dados de demonstração (Mocks removidos).</p>
        </footer>
      </div>
    );
  }

  // Calculate day-by-day logs dynamically for the active employee
  const summaries = calculateDailySummaries(activeEmployee, entries);

  // Get index logs of entries registered TODAY
  const getTodayEntries = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.employeeId === activeEmployee.id && e.timestamp.startsWith(todayStr));
  };

  const todayEntries = getTodayEntries();

  // Core PUNCH trigger handler (ClockIn)
  const handleClockIn = async (type: TimeEntryType, justification: string, location?: GeoLocationData) => {
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
        description: 'Home Office (Padrão corporativo)'
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

    // Synergize live to Supabase if active
    if (hasSupabase) {
      const success = await insertTimeEntry(freshEntry);
      if (success) {
        setNotification({
          message: `Batida de "${typeNames[type]}" gravada e sincronizada com o Supabase!`,
          type: 'success'
        });
      }
    }
  };

  // Triggered when retroactively adjusting / retroactive entries
  const handleAddManualEntry = async (
    dateString: string, 
    timeString: string, 
    type: TimeEntryType, 
    justification: string
  ) => {
    // Parse to construct absolute ISO timestamp
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

    // Synergize live to Supabase if active
    if (hasSupabase) {
      const success = await insertTimeEntry(freshEntry);
      if (success) {
        setNotification({
          message: 'Ponto ajustado e gravado no banco de dados do Supabase!',
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
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white py-3 px-5 rounded-xl shadow-2xl border border-slate-700 max-w-sm animate-fade-in"
          id="system-toast-alert"
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-medium leading-normal">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white shrink-0 ml-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Styled Top Branding Navbar */}
      <Navbar />

      {/* Root Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2" id="welcome-bar">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Olá, <span className="text-indigo-600">{activeEmployee.name}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Setor de {activeEmployee.department} &bull; Visualize suas métricas de jornada CLT abaixo.
            </p>
          </div>
          
          {/* Dynamic Database Status Badge */}
          <div className="flex gap-2">
            {hasSupabase ? (
              supabaseConnected === true ? (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs" id="subabase-connected-badge">
                  <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-[11px] font-bold font-sans">Supabase Conectado</span>
                </div>
              ) : supabaseConnected === false ? (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs" id="supabase-incomplete-badge">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-bold font-sans">Aguardando Tabelas</span>
                </div>
              ) : (
                <div className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs" id="supabase-connecting-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
                  <span className="text-[11px] font-bold font-sans">Conectando Supabase...</span>
                </div>
              )
            ) : (
              <div className="bg-slate-100 text-slate-600 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xs text-xs" id="local-mode-badge">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                <span className="text-[11px] font-semibold text-gray-600 font-mono">Modo Local/Offline Ativo</span>
              </div>
            )}

            <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-600 font-mono text-xs">Portaria 671 MTE</span>
            </div>
          </div>
        </div>

        {/* Dashboard Performance Metrics widgets */}
        <DashboardStats summaries={summaries} employee={activeEmployee} />

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel - Clock operations & selection */}
          <div className="lg:col-span-5 space-y-6">
            {/* Clock in widget */}
            <ClockWidget 
              onClockIn={handleClockIn} 
              todayEntries={todayEntries} 
              employeeName={activeEmployee.name} 
            />

            {/* Profile switching / worker registers */}
            <EmployeeSelector 
              employees={employees} 
              selectedId={selectedEmpId} 
              onSelect={setSelectedEmpId} 
              onAddEmployee={handleAddEmployee}
            />
          </div>

          {/* Right panel - Full monthly ledger tables */}
          <div className="lg:col-span-7">
            <TimeCardTable 
              summaries={summaries} 
              onAddManualEntry={handleAddManualEntry} 
              employeeName={activeEmployee.name} 
            />
          </div>
        </div>
      </main>

      {/* Dynamic Legal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Ponto Digital. Desenvolvido em conformidade com as diretrizes do Ministério do Trabalho e Emprego (MTE) brasileiro.</p>
        <p className="mt-1 text-[10px]">Utiliza autenticação baseada em localStorage e auditoria criptografada simulada de coordenadas.</p>
      </footer>
    </div>
  );
}
