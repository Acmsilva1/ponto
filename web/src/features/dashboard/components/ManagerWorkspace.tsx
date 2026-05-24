import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { EChartsOption } from 'echarts';
import { UsersRound, X } from 'lucide-react';
import type { DashboardSummary, Employee, Justification, TimeEntry } from '@shared/contracts';
import { deleteEmployee, updateEmployee } from '../../employees/services/employeesService.js';
import { registerCollaboratorByManager } from '../../auth/services/authService.js';
import { MonthlyTimesheetCard } from '../../time-entries/components/MonthlyTimesheetCard.js';
import { EChartCard } from './EChartCard.js';

interface ManagerWorkspaceProps {
  employee: Employee;
  employees: Employee[];
  selectedEmployee: Employee;
  onSelectEmployee: (employeeId: string) => void;
  onRefresh: () => Promise<void>;
  timeEntries: TimeEntry[];
  justifications: Justification[];
  summary: DashboardSummary;
}

function formatLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getBrasiliaDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  return {
    year: parts.find((part) => part.type === 'year')?.value || '0000',
    month: parts.find((part) => part.type === 'month')?.value || '00',
    day: parts.find((part) => part.type === 'day')?.value || '00'
  };
}

function getBrasiliaDateKey(date: Date) {
  const { year, month, day } = getBrasiliaDateParts(date);
  return `${year}-${month}-${day}`;
}

function getBrasiliaMonthKey(date: Date) {
  return getBrasiliaDateKey(date).slice(0, 7);
}

function formatDuration(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`;
}

function sumJourneyMinutes(entries: TimeEntry[]) {
  const byDay = new Map<string, TimeEntry[]>();

  for (const entry of entries) {
    const dateKey = getBrasiliaDateKey(new Date(entry.timestamp));
    const current = byDay.get(dateKey) || [];
    current.push(entry);
    byDay.set(dateKey, current);
  }

  let totalMinutes = 0;

  for (const dayEntries of byDay.values()) {
    const sorted = [...dayEntries].sort((left, right) => left.timestamp.localeCompare(right.timestamp));

    for (let index = 0; index + 1 < sorted.length; index += 2) {
      totalMinutes += (new Date(sorted[index + 1].timestamp).getTime() - new Date(sorted[index].timestamp).getTime()) / 60000;
    }
  }

  return totalMinutes;
}

export function ManagerWorkspace({
  employee,
  employees,
  selectedEmployee,
  onSelectEmployee,
  onRefresh,
  timeEntries,
  justifications,
  summary
}: ManagerWorkspaceProps) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRegistryId, setNewRegistryId] = useState('');
  const [registerBusy, setRegisterBusy] = useState(false);
  const [registerFeedback, setRegisterFeedback] = useState('');
  const [employeeFeedback, setEmployeeFeedback] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editRegistryId, setEditRegistryId] = useState('');
  const [employeeBusy, setEmployeeBusy] = useState(false);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [employeeMonth, setEmployeeMonth] = useState(() => getBrasiliaMonthKey(new Date()));

  useEffect(() => {
    setEditName(selectedEmployee.name || '');
    setEditRole(selectedEmployee.role || '');
    setEditRegistryId(selectedEmployee.registryId || '');
    setEditMode(false);
    setEmployeeFeedback('');
  }, [selectedEmployee.id, selectedEmployee.name, selectedEmployee.role, selectedEmployee.registryId]);

  const selectedEmployeeEntries = useMemo(
    () => timeEntries.filter((entry) => entry.employeeId === selectedEmployee.id),
    [selectedEmployee.id, timeEntries]
  );

  const selectedEmployeeMonthEntries = useMemo(
    () =>
      selectedEmployeeEntries
        .filter((entry) => getBrasiliaDateKey(new Date(entry.timestamp)).startsWith(employeeMonth))
        .sort((left, right) => left.timestamp.localeCompare(right.timestamp)),
    [employeeMonth, selectedEmployeeEntries]
  );

  const selectedEmployeeOfficialEntries = useMemo(
    () => selectedEmployeeMonthEntries.filter((entry) => entry.journey === 'official'),
    [selectedEmployeeMonthEntries]
  );

  const selectedEmployeeExtraEntries = useMemo(
    () => selectedEmployeeMonthEntries.filter((entry) => entry.journey === 'extra'),
    [selectedEmployeeMonthEntries]
  );

  const employeeSummary = useMemo(
    () => ({
      workedHours: formatDuration(sumJourneyMinutes(selectedEmployeeOfficialEntries)),
      extraHours: formatDuration(sumJourneyMinutes(selectedEmployeeExtraEntries))
    }),
    [selectedEmployeeExtraEntries, selectedEmployeeOfficialEntries]
  );

  const chartData = useMemo(() => {
    const collaboratorsOnly = employees.filter((item) => !item.isMaster);

    const byEmployee = collaboratorsOnly
      .map((item) => ({
        name: item.name.split(' ')[0],
        value: timeEntries.filter((entry) => entry.employeeId === item.id).length
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const lastDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = dayKey(date);
      return {
        label: formatLabel(date),
        key,
        total: timeEntries.filter((entry) => entry.timestamp.startsWith(key)).length
      };
    });

    const statusTotals = [
      { name: 'Pendentes', value: justifications.filter((item) => item.status === 'pending').length },
      { name: 'Aprovadas', value: justifications.filter((item) => item.status === 'approved').length },
      { name: 'Rejeitadas', value: justifications.filter((item) => item.status === 'rejected').length }
    ];

    const typeTotals = [
      { name: 'Entrada', value: timeEntries.filter((item) => item.journey === 'official' && item.type === 'entrada').length },
      { name: 'Almoço saída', value: timeEntries.filter((item) => item.journey === 'official' && item.type === 'almoco_saida').length },
      { name: 'Retorno', value: timeEntries.filter((item) => item.journey === 'official' && item.type === 'almoco_retorno').length },
      { name: 'Saída', value: timeEntries.filter((item) => item.journey === 'official' && item.type === 'saida').length }
    ];

    return { byEmployee, lastDays, statusTotals, typeTotals, collaboratorsOnly };
  }, [employees, justifications, timeEntries]);

  const activityOption = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 0, right: 0, top: 20, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.lastDays.map((item) => item.label),
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.25)' } },
        axisLabel: { color: '#cbd5e1' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.12)' } },
        axisLabel: { color: '#cbd5e1' }
      },
      series: [
        {
          type: 'bar',
          data: chartData.lastDays.map((item) => item.total),
          barWidth: 18,
          itemStyle: {
            borderRadius: [12, 12, 0, 0],
            color: '#6366f1'
          }
        }
      ]
    }),
    [chartData.lastDays]
  );

  const employeeOption = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: '#cbd5e1' } },
      series: [
        {
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#020617',
            borderWidth: 3
          },
          label: { color: '#e2e8f0' },
          data: chartData.byEmployee.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#6366f1', '#14b8a6', '#f59e0b', '#f43f5e', '#38bdf8', '#a855f7'][index % 6]
            }
          }))
        }
      ]
    }),
    [chartData.byEmployee]
  );

  const statusOption = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: '#cbd5e1' } },
      series: [
        {
          type: 'pie',
          radius: ['38%', '68%'],
          center: ['50%', '42%'],
          label: { color: '#e2e8f0' },
          data: chartData.statusTotals.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#f97316', '#22c55e', '#ef4444'][index]
            }
          }))
        }
      ]
    }),
    [chartData.statusTotals]
  );

  const typeOption = useMemo<EChartsOption>(
    () => ({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      radar: {
        indicator: chartData.typeTotals.map((item) => ({
          name: item.name,
          max: Math.max(...chartData.typeTotals.map((entry) => entry.value), 1)
        })),
        axisName: { color: '#cbd5e1' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.14)' } },
        splitArea: { areaStyle: { color: ['rgba(15, 23, 42, 0.25)', 'rgba(15, 23, 42, 0.12)'] } }
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: chartData.typeTotals.map((item) => item.value),
              name: 'Tipos',
              areaStyle: { color: 'rgba(99, 102, 241, 0.25)' },
              lineStyle: { color: '#6366f1', width: 2 },
              itemStyle: { color: '#6366f1' }
            }
          ]
        }
      ]
    }),
    [chartData.typeTotals]
  );

  async function handleRegisterCollaborator(event: FormEvent) {
    event.preventDefault();
    setRegisterBusy(true);
    setRegisterFeedback('');
    try {
      const result = await registerCollaboratorByManager({
        name: newName.trim(),
        role: newRole.trim(),
        registryId: newRegistryId.trim()
      });

      setNewName('');
      setNewRole('');
      setNewRegistryId('');
      await onRefresh();
      setRegisterFeedback(`Colaborador ${result.employee.name} cadastrado com sucesso. Matrícula: ${result.employee.registryId}.`);
    } catch (error) {
      setRegisterFeedback(error instanceof Error ? error.message : 'Falha ao cadastrar colaborador.');
    } finally {
      setRegisterBusy(false);
    }
  }

  async function handleSaveEmployee() {
    setEmployeeBusy(true);
    setEmployeeFeedback('');
    try {
      const result = await updateEmployee(selectedEmployee.id, {
        name: editName.trim(),
        role: editRole.trim(),
        registryId: editRegistryId.trim()
      });
      onSelectEmployee(result.employee.id);
      await onRefresh();
      setEmployeeFeedback('Colaborador atualizado com sucesso.');
    } catch (error) {
      setEmployeeFeedback(error instanceof Error ? error.message : 'Falha ao atualizar colaborador.');
    } finally {
      setEmployeeBusy(false);
    }
  }

  async function handleDeleteEmployee() {
    if (!window.confirm(`Excluir ${selectedEmployee.name}? Essa ação não pode ser desfeita.`)) {
      return;
    }

    setEmployeeBusy(true);
    setEmployeeFeedback('');
    try {
      await deleteEmployee(selectedEmployee.id);
      const remaining = employees.filter((item) => item.id !== selectedEmployee.id && !item.isMaster);
      onSelectEmployee(remaining[0]?.id || '');
      await onRefresh();
      setEmployeeFeedback('Colaborador excluído com sucesso.');
    } catch (error) {
      setEmployeeFeedback(error instanceof Error ? error.message : 'Falha ao excluir colaborador.');
    } finally {
      setEmployeeBusy(false);
    }
  }

  function openEmployeeDetails(employeeId: string) {
    onSelectEmployee(employeeId);
    setEmployeeMonth(getBrasiliaMonthKey(new Date()));
    setShowEmployeeDetailsModal(true);
    setEditMode(false);
    setEmployeeFeedback('');
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300/80">Gestor</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Olá, {employee.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Aqui você acompanha o coletivo sem confundir seu perfil com a equipe.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Colaboradores</p>
              <p className="mt-2 text-3xl font-black text-white">{summary.employeesCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Batidas</p>
              <p className="mt-2 text-3xl font-black text-white">{summary.timeEntriesCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Justificativas</p>
              <p className="mt-2 text-3xl font-black text-white">{summary.justificationsCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Pendências</p>
              <p className="mt-2 text-3xl font-black text-white">{summary.pendingJustificationsCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <div className="grid gap-4 xl:grid-cols-2">
          <EChartCard title="Volume diário" description="Batidas acumuladas nos últimos 7 dias." option={activityOption} height={320} />
          <EChartCard
            title="Justificativas"
            description="Distribuição entre pendentes, aprovadas e rejeitadas."
            option={statusOption}
            height={320}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <EChartCard title="Batidas por tipo" description="Comparativo entre entrada, almoço e saída." option={typeOption} height={340} />
          <EChartCard
            title="Top colaboradores"
            description="Quem mais registrou ponto no período."
            option={employeeOption}
            height={340}
          />
        </div>

        <section className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Atalhos administrativos</p>
            <h3 className="mt-2 text-2xl font-black text-white">Gerenciar colaboradores</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Abra os modais abaixo para cadastrar, consultar, editar ou excluir colaboradores.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5"
            >
              Cadastrar colaborador
            </button>
            <button
              type="button"
              onClick={() => setShowEmployeesModal(true)}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20">
                <UsersRound className="h-4 w-4 text-cyan-300" />
              </span>
              Ver colaboradores
            </button>
          </div>
        </section>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300/80">Cadastro administrativo</p>
                <h3 className="mt-2 text-2xl font-black text-white">Novo colaborador</h3>
                <p className="mt-2 text-sm text-slate-400">
                  A senha padrão é <span className="font-bold text-white">12345</span> e a troca será obrigatória no primeiro acesso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleRegisterCollaborator} className="mt-6 space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome completo"
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Função"
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />
              <input
                value={newRegistryId}
                onChange={(e) => setNewRegistryId(e.target.value)}
                placeholder="Matrícula"
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/[0.06]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registerBusy}
                  className="flex-1 rounded-[1.25rem] bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registerBusy ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>

            {registerFeedback && (
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-100">
                {registerFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {showEmployeesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-sm">
          <div className="flex h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_30px_120px_rgba(2,6,23,0.6)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300/80">Colaboradores</p>
                <h3 className="mt-2 text-2xl font-black text-white">Selecione um colaborador</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEmployeesModal(false);
                  setShowEmployeeDetailsModal(false);
                  setEditMode(false);
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
              >
                Fechar
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[0.44fr_0.56fr]">
              <aside className="min-h-0 overflow-y-auto border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Lista</p>
                  <h4 className="mt-2 text-lg font-black text-white">Nomes dos colaboradores</h4>
                  <p className="mt-2 text-sm text-slate-400">Clique em um nome para abrir os dados mensais.</p>
                </div>

                <div className="mt-4 space-y-2">
                  {chartData.collaboratorsOnly.length === 0 ? (
                    <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                      Nenhum colaborador encontrado.
                    </div>
                  ) : (
                    chartData.collaboratorsOnly.map((item) => {
                      const active = item.id === selectedEmployee.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openEmployeeDetails(item.id)}
                          className={`w-full rounded-[1.25rem] border px-4 py-4 text-left transition ${
                            active
                              ? 'border-indigo-400/40 bg-indigo-500/15'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                        >
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              <section className="hidden min-h-0 items-center justify-center border-l border-white/10 bg-white/[0.02] p-6 lg:flex">
                <div className="max-w-sm rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/70 p-6 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Detalhe</p>
                  <h4 className="mt-2 text-xl font-black text-white">Abra um colaborador</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    O submodal vai exibir os dados do colaborador, o resumo mensal e todas as batidas do mês selecionado.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {showEmployeeDetailsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 px-4 backdrop-blur-md">
          <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_30px_120px_rgba(2,6,23,0.7)]">
            <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-transparent to-cyan-500/10 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/10 text-xl font-black text-white ${selectedEmployee.avatarColor}`}
                  >
                    {selectedEmployee.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300/80">Detalhe do colaborador</p>
                    <h3 className="mt-2 text-3xl font-black text-white">{selectedEmployee.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">Matrícula: {selectedEmployee.registryId}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                        {selectedEmployee.role}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                        {selectedEmployee.department}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                        {selectedEmployee.accessRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode((current) => !current)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.06]"
                  >
                    {editMode ? 'Fechar edição' : 'Editar dados'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmployeeDetailsModal(false);
                      setEditMode(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.06]"
                  >
                    <X className="h-4 w-4" />
                    Fechar
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Horas trabalhadas</p>
                  <p className="mt-2 text-3xl font-black text-white">{employeeSummary.workedHours}</p>
                </div>
                <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/80">Horas extras</p>
                  <p className="mt-2 text-3xl font-black text-amber-50">{employeeSummary.extraHours}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Batidas no mês</p>
                  <p className="mt-2 text-3xl font-black text-white">{selectedEmployeeMonthEntries.length}</p>
                </div>
              </div>

              {editMode && (
                <div className="mt-6 rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100/80">Editar colaborador</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                    <input
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      placeholder="Função"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                    <input
                      value={editRegistryId}
                      onChange={(e) => setEditRegistryId(e.target.value)}
                      placeholder="Matrícula"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSaveEmployee}
                      disabled={employeeBusy}
                      className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {employeeBusy ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteEmployee}
                      disabled={employeeBusy || selectedEmployee.isMaster}
                      className="rounded-full border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>

                  {employeeFeedback && (
                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-100">
                      {employeeFeedback}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <MonthlyTimesheetCard
                  entries={selectedEmployeeEntries}
                  selectedMonth={employeeMonth}
                  onSelectedMonthChange={setEmployeeMonth}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
