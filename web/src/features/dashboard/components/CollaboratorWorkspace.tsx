import { ArrowUpRight, BadgeCheck, Clock3, ShieldCheck } from 'lucide-react';
import type { DashboardSummary, Employee, Justification, TimeEntry, TimeEntryType } from '@shared/contracts';
import { ClockWidget } from '../../time-entries/components/ClockWidget.js';
import { TimeCardTable } from '../../time-entries/components/TimeCardTable.js';

interface CollaboratorWorkspaceProps {
  employee: Employee;
  timeEntries: TimeEntry[];
  justifications: Justification[];
  summary: DashboardSummary;
  onClock: (type: TimeEntryType, justification: string) => Promise<void>;
  onOpenProfile: () => void;
}

const infoCards = [
  {
    label: 'Objetivo',
    title: 'Registrar sem fricção',
    text: 'Bata ponto em um clique e acompanhe seus últimos registros em tempo real.'
  },
  {
    label: 'Segurança',
    title: 'Senha sob controle',
    text: 'Troque a senha a qualquer momento na área de perfil da conta.'
  }
];

export function CollaboratorWorkspace({
  employee,
  timeEntries,
  justifications,
  summary,
  onClock,
  onOpenProfile
}: CollaboratorWorkspaceProps) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const recentJustifications = justifications.slice(0, 3);
  const recentEntries = timeEntries.slice(0, 6);
  const todayEntries = timeEntries.filter((entry) => entry.timestamp.startsWith(todayKey)).length;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-300/80">Colaborador</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Olá, {employee.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                Sua área é objetiva: bater ponto, revisar os registros mais recentes e manter sua senha atualizada.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Registro</p>
                <p className="mt-1 text-sm font-semibold text-white">{employee.registryId}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Setor</p>
                <p className="mt-1 text-sm font-semibold text-white">{employee.department}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {infoCards.map((card) => (
            <article key={card.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{card.text}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/10 p-5">
            <Clock3 className="h-5 w-5 text-emerald-300" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">Hoje</p>
            <p className="mt-2 text-3xl font-black text-white">{todayEntries}</p>
            <p className="mt-2 text-sm text-emerald-100/70">batidas registradas</p>
          </div>

          <div className="rounded-[1.5rem] border border-indigo-500/15 bg-indigo-500/10 p-5">
            <BadgeCheck className="h-5 w-5 text-indigo-300" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">Batidas</p>
            <p className="mt-2 text-3xl font-black text-white">{timeEntries.length}</p>
            <p className="mt-2 text-sm text-indigo-100/70">histórico consolidado</p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-500/15 bg-amber-500/10 p-5">
            <ShieldCheck className="h-5 w-5 text-amber-300" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">Senha</p>
            <button
              type="button"
              onClick={onOpenProfile}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Abrir perfil
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <p className="mt-2 text-sm text-amber-100/70">troca de senha e dados da conta</p>
          </div>
        </div>

        <ClockWidget onClock={onClock} />
      </div>

      <div className="space-y-6">
        <TimeCardTable entries={recentEntries} dark />

        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Justificativas</h3>
              <p className="mt-1 text-xs text-slate-400">Últimas justificativas enviadas</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {summary.pendingJustificationsCount} pendências
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {recentJustifications.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
                Sem justificativas no momento.
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
    </section>
  );
}
