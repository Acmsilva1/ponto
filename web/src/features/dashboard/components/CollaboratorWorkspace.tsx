import { BadgeCheck, Clock3, ShieldCheck } from 'lucide-react';
import type { Employee, Justification, TimeEntry, TimeEntryType } from '@shared/contracts';
import { ClockWidget } from '../../time-entries/components/ClockWidget.js';
import { MonthlyTimesheetCard } from '../../time-entries/components/MonthlyTimesheetCard.js';

interface CollaboratorWorkspaceProps {
  employee: Employee;
  timeEntries: TimeEntry[];
  justifications: Justification[];
  onClock: (type: TimeEntryType, justification: string) => Promise<void>;
}

function getBrasiliaDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value || '0000';
  const month = parts.find((part) => part.type === 'month')?.value || '00';
  const day = parts.find((part) => part.type === 'day')?.value || '00';

  return `${year}-${month}-${day}`;
}

function getBrasiliaMonthKey(date: Date) {
  return getBrasiliaDateKey(date).slice(0, 7);
}

function getBrasiliaTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(date);
}

function getEntryLabel(type: TimeEntryType) {
  const labels: Record<TimeEntryType, string> = {
    entrada: 'Entrada',
    almoco_saida: 'Início do intervalo',
    almoco_retorno: 'Retorno do intervalo',
    saida: 'Saída final'
  };

  return labels[type];
}

export function CollaboratorWorkspace({ employee, timeEntries, justifications, onClock }: CollaboratorWorkspaceProps) {
  const now = new Date();
  const todayKey = getBrasiliaDateKey(now);
  const monthKey = getBrasiliaMonthKey(now);

  const todayEntries = timeEntries.filter((entry) => getBrasiliaDateKey(new Date(entry.timestamp)) === todayKey);
  const monthEntries = timeEntries.filter((entry) => getBrasiliaDateKey(new Date(entry.timestamp)).startsWith(monthKey));
  const pendingJustifications = justifications.filter((item) => item.status === 'pending');
  const recentJustifications = justifications.slice(0, 4);
  const latestEntry = [...timeEntries].sort((left, right) => right.timestamp.localeCompare(left.timestamp))[0];

  return (
    <section className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300/80">Área operacional</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Olá, {employee.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Registre o ponto, acompanhe a folha do mês e mantenha a sua conta sempre atualizada. Tudo em uma tela objetiva.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Registro funcional</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee.registryId}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Função</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee.role}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Setor</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee.department}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/10 p-5">
          <Clock3 className="h-5 w-5 text-emerald-300" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/80">Registros de hoje</p>
          <p className="mt-2 text-3xl font-black text-white">{todayEntries.length}</p>
          <p className="mt-2 text-sm text-emerald-100/70">marcados em Brasília</p>
        </article>

        <article className="rounded-[1.5rem] border border-indigo-500/15 bg-indigo-500/10 p-5">
          <BadgeCheck className="h-5 w-5 text-indigo-300" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200/80">Registros do mês</p>
          <p className="mt-2 text-3xl font-black text-white">{monthEntries.length}</p>
          <p className="mt-2 text-sm text-indigo-100/70">folha consolidada</p>
        </article>

        <article className="rounded-[1.5rem] border border-amber-500/15 bg-amber-500/10 p-5">
          <ShieldCheck className="h-5 w-5 text-amber-300" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">Justificativas pendentes</p>
          <p className="mt-2 text-3xl font-black text-white">{pendingJustifications.length}</p>
          <p className="mt-2 text-sm text-amber-100/70">em análise</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <ClockWidget onClock={onClock} />
          <MonthlyTimesheetCard entries={timeEntries} />
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Perfil profissional</h3>
            <p className="mt-1 text-xs text-slate-400">Dados de acesso e referência do colaborador</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Registro funcional</p>
                <p className="mt-2 text-sm font-semibold text-white">{employee.registryId}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Última marcação</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {latestEntry ? `${getEntryLabel(latestEntry.type)} às ${getBrasiliaTime(new Date(latestEntry.timestamp))}` : 'Sem marcações'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Função</p>
                <p className="mt-2 text-sm font-semibold text-white">{employee.role}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Setor</p>
                <p className="mt-2 text-sm font-semibold text-white">{employee.department}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Justificativas recentes</h3>
                <p className="mt-1 text-xs text-slate-400">Últimos registros enviados pelo colaborador</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {pendingJustifications.length} pendências
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {recentJustifications.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
                  Nenhuma justificativa enviada até o momento.
                </p>
              ) : (
                recentJustifications.map((item) => (
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
      </div>
    </section>
  );
}
