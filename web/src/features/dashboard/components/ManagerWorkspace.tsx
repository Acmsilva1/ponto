import { useMemo, useState, type FormEvent } from 'react';
import type { EChartsOption } from 'echarts';
import type { DashboardSummary, Employee, Justification, TimeEntry } from '@shared/contracts';
import { EmployeeSelector } from '../../employees/components/EmployeeSelector.js';
import { TimeCardTable } from '../../time-entries/components/TimeCardTable.js';
import { EChartCard } from './EChartCard.js';
import { registerCollaboratorByManager } from '../../auth/services/authService.js';

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
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [registerBusy, setRegisterBusy] = useState(false);
  const [registerFeedback, setRegisterFeedback] = useState('');

  const chartData = useMemo(() => {
    const byEmployee = employees
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
      { name: 'Entrada', value: timeEntries.filter((item) => item.type === 'entrada').length },
      { name: 'Almoço saída', value: timeEntries.filter((item) => item.type === 'almoco_saida').length },
      { name: 'Retorno', value: timeEntries.filter((item) => item.type === 'almoco_retorno').length },
      { name: 'Saída', value: timeEntries.filter((item) => item.type === 'saida').length }
    ];

    return { byEmployee, lastDays, statusTotals, typeTotals };
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

  const selectedEntries = timeEntries.filter((entry) => entry.employeeId === selectedEmployee.id);
  const selectedJustifications = justifications.filter((item) => item.employeeId === selectedEmployee.id);

  async function handleRegisterCollaborator(event: FormEvent) {
    event.preventDefault();
    setRegisterBusy(true);
    setRegisterFeedback('');
    try {
      const result = await registerCollaboratorByManager({
        name: newName.trim(),
        role: newRole.trim(),
        department: newDepartment.trim(),
        password: newPassword
      });

      setNewName('');
      setNewRole('');
      setNewDepartment('');
      setNewPassword('');
      await onRefresh();
      setRegisterFeedback(`Colaborador ${result.employee.name} cadastrado com sucesso. Registro: ${result.employee.registryId}.`);
    } catch (error) {
      setRegisterFeedback(error instanceof Error ? error.message : 'Falha ao cadastrar colaborador.');
    } finally {
      setRegisterBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300/80">Gestor</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Olá, {employee.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Aqui você acompanha o coletivo: volume de batidas, justificativas, evolução diária e comparação entre colaboradores.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Colaboradores</p>
              <p className="mt-1 text-2xl font-black text-white">{summary.employeesCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Batidas</p>
              <p className="mt-1 text-2xl font-black text-white">{summary.timeEntriesCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Justificativas</p>
              <p className="mt-1 text-2xl font-black text-white">{summary.justificationsCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Pendências</p>
              <p className="mt-1 text-2xl font-black text-white">{summary.pendingJustificationsCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-indigo-400/20 bg-indigo-500/10 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100/80">Cadastro administrativo</p>
            <h3 className="mt-2 text-2xl font-black text-white">Novo colaborador</h3>
            <p className="mt-2 text-sm leading-6 text-indigo-50/80">
              Cadastre pessoas para registrar ponto. O gestor é o único perfil com essa permissão.
            </p>

            <form onSubmit={handleRegisterCollaborator} className="mt-5 space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome completo"
                className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Cargo"
                className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />
              <input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Setor"
                className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Senha desejada"
                className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={registerBusy}
                className="w-full rounded-[1.25rem] bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerBusy ? 'Cadastrando...' : 'Cadastrar colaborador'}
              </button>
            </form>

            {registerFeedback && (
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-100">
                {registerFeedback}
              </div>
            )}
          </section>

          <EmployeeSelector employees={employees} selectedId={selectedEmployee.id} onSelect={onSelectEmployee} dark />

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Colaborador selecionado</p>
            <h3 className="mt-2 text-2xl font-black text-white">{selectedEmployee.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selectedEmployee.department}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Cargo</p>
                <p className="mt-1 font-semibold text-white">{selectedEmployee.role}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Perfil</p>
                <p className="mt-1 font-semibold text-white">{selectedEmployee.accessRole}</p>
              </div>
            </div>
          </section>

          <TimeCardTable entries={selectedEntries.slice(0, 8)} dark />

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Justificativas do colaborador</h3>
            <div className="mt-4 space-y-3">
              {selectedJustifications.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
                  Nenhuma justificativa encontrada.
                </p>
              ) : (
                selectedJustifications.slice(0, 5).map((item) => (
                  <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.reason}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{item.date}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <EChartCard title="Volume diário" description="Batidas acumuladas nos últimos 7 dias." option={activityOption} height={300} />
            <EChartCard
              title="Justificativas"
              description="Distribuição entre pendentes, aprovadas e rejeitadas."
              option={statusOption}
              height={300}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <EChartCard
              title="Batidas por tipo"
              description="Comparativo entre entrada, almoço e saída."
              option={typeOption}
              height={340}
            />
            <EChartCard
              title="Top colaboradores"
              description="Quem mais registrou ponto no período."
              option={employeeOption}
              height={340}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
