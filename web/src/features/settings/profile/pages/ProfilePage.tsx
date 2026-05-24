import { ArrowLeft, Clock3, Shield, Sparkles, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Employee } from '@shared/contracts';
import { updateProfilePassword } from '../services/profileService.js';

interface ProfilePageProps {
  employee: Employee;
  onBackToDashboard: () => void;
  onLogout: () => Promise<void> | void;
  onProfileUpdated: (employee: Employee) => Promise<void> | void;
}

export function ProfilePage({ employee, onBackToDashboard, onLogout, onProfileUpdated }: ProfilePageProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const isManager = employee.accessRole === 'gestor';

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await updateProfilePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setFeedback('Senha atualizada com sucesso.');
      await onProfileUpdated(result.employee);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao atualizar senha.');
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">Ponto Digital</h1>
              <p className="text-xs text-slate-400">Perfil e segurança da conta</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!employee.mustChangePassword && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:-translate-y-0.5 hover:bg-rose-500/20"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
              {isManager ? <Shield className="h-5 w-5 text-indigo-300" /> : <User className="h-5 w-5 text-emerald-300" />}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Conta ativa</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{employee.name}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {isManager ? 'Acesso de gestor com leitura completa dos dados.' : 'Acesso de colaborador com foco operacional.'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <span className="text-slate-500">Registro:</span> {employee.registryId}
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <span className="text-slate-500">Perfil:</span> {isManager ? 'Gestor' : 'Colaborador'}
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <span className="text-slate-500">Cargo:</span> {employee.role}
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              <span className="text-slate-500">Setor:</span> {employee.department}
            </div>
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-indigo-400/20 bg-indigo-500/10 p-5 text-sm text-indigo-50">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4" />
              Boas práticas
            </p>
            <p className="mt-2 leading-6 text-indigo-50/80">
              Use uma senha forte e troque-a sempre que houver recuperação de acesso.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Segurança da conta</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Troca de senha</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Atualize sua senha aqui. Se você entrou com uma senha provisória, finalize essa etapa antes de voltar ao painel.
            </p>
          </div>

          {employee.mustChangePassword && (
            <div className="mt-5 rounded-[1.35rem] border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              Esta conta exige troca de senha antes de continuar.
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              placeholder="Senha atual"
              className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
            />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Nova senha"
              className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
            />
            <button
              type="submit"
              className="w-full rounded-[1.25rem] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5"
            >
              Atualizar senha
            </button>
          </form>

          {feedback && (
            <section className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
              {feedback}
            </section>
          )}
        </section>
      </main>
    </main>
  );
}
