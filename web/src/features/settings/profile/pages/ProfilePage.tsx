import { ArrowLeft, Clock, Shield, User } from 'lucide-react';
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
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-950">Ponto Digital</h1>
              <p className="text-xs text-slate-500">Perfil e segurança da conta</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!employee.mustChangePassword && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            {employee.accessRole === 'gestor' ? (
              <Shield className="h-5 w-5 text-indigo-600" />
            ) : (
              <User className="h-5 w-5 text-emerald-600" />
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Conta ativa</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{employee.name}</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Registro:</span> {employee.registryId}</p>
            <p><span className="font-semibold text-slate-900">Perfil:</span> {employee.accessRole === 'gestor' ? 'Gestor' : 'Colaborador'}</p>
            <p><span className="font-semibold text-slate-900">Cargo:</span> {employee.role}</p>
            <p><span className="font-semibold text-slate-900">Setor:</span> {employee.department}</p>
          </div>

          <div className="mt-6 rounded-3xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-950">
            <p className="font-semibold">Recomendação de segurança</p>
            <p className="mt-2 leading-6">
              Sempre use uma senha pessoal, exclusiva e altere-a imediatamente após uma recuperação de acesso.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Segurança da conta</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Troca de senha</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Atualize sua senha aqui. Se você entrou com uma senha provisória, esta é a primeira etapa antes de voltar ao painel.
            </p>
          </div>

          {employee.mustChangePassword && (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Esta conta exige troca de senha antes de continuar.
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              placeholder="Senha atual"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
            />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Nova senha"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Atualizar senha
            </button>
          </form>

          {feedback && (
            <section className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {feedback}
            </section>
          )}
        </section>
      </main>
    </main>
  );
}
