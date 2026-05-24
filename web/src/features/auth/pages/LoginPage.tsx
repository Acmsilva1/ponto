import { Eye, EyeOff, Fingerprint, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Employee } from '@shared/contracts';
import { login, recoverPassword, register } from '../services/authService.js';

interface LoginPageProps {
  onLogin: (employee: Employee, token?: string) => Promise<void> | void;
  onRegister: (employee: Employee, token?: string) => Promise<void> | void;
  apiStatus: 'idle' | 'connected' | 'error';
}

export function LoginPage({ onLogin, onRegister, apiStatus }: LoginPageProps) {
  const [tab, setTab] = useState<'colaborador' | 'gestor'>('colaborador');
  const [registryId, setRegistryId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await login({ registryId: registryId.trim(), password });
      await onLogin(result.session.employee, result.session.token);
      setMessage(result.requiresPasswordChange ? 'Troque sua senha no perfil.' : 'Login efetuado com sucesso.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha no login.');
    } finally {
      setBusy(false);
    }
  }

  async function submitRegister(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await register({
        name: regName,
        role: regRole,
        department: regDepartment,
        password: regPassword
      });
      await onRegister(result.session.employee, result.session.token);
      setMessage(`Cadastro criado e autenticado. Seu registro é ${result.session.employee.registryId}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao cadastrar.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRecovery() {
    if (!registryId.trim()) {
      setMessage('Informe o registro antes de recuperar o acesso.');
      return;
    }

    setRecoveryBusy(true);
    try {
      const result = await recoverPassword({ registryId: registryId.trim() });
      setPassword(result.temporaryPassword);
      setShowPassword(false);
      setMessage(`Senha provisória gerada para ${result.employee.name}: ${result.temporaryPassword}. Entre com ela e troque no perfil.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao recuperar acesso.');
    } finally {
      setRecoveryBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/85 shadow-[0_30px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]" />

          <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="border-b border-white/10 px-8 py-10 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                <span className={`h-2 w-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-400' : apiStatus === 'error' ? 'bg-rose-400' : 'bg-amber-300'}`} />
                {apiStatus === 'connected' ? 'API conectada' : apiStatus === 'error' ? 'API indisponível' : 'Conectando...'}
              </div>

              <div className="mt-8 max-w-2xl">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Ponto Digital.
                  <span className="block bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
                    operacional, elegante e direto.
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-400">
                  Cadastro real, login real e ponto real. O frontend só apresenta a experiência; a API valida, grava e responde.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <UserPlus className="h-5 w-5 text-indigo-300" />
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Cadastro</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">O próprio usuário cria o acesso.</p>
                </article>
                <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <Fingerprint className="h-5 w-5 text-cyan-300" />
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Gestor</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">Login master: gestor / 12345.</p>
                </article>
                <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Segurança</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">Sessão e regras no backend.</p>
                </article>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Dark mode nativo</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Tailwind + CSS base</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Fluxos separados por função</span>
              </div>
            </section>

            <section className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTab('colaborador')}
                    className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
                      tab === 'colaborador'
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_18px_40px_rgba(79,70,229,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Colaborador
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('gestor')}
                    className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
                      tab === 'gestor'
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_18px_40px_rgba(79,70,229,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gestor
                  </button>
                </div>
              </div>

              {message && (
                <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                  {message}
                </div>
              )}

              <form onSubmit={submitLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {tab === 'gestor' ? 'Registro do gestor' : 'Registro do colaborador'}
                  </label>
                  <input
                    value={registryId}
                    onChange={(e) => setRegistryId(e.target.value)}
                    placeholder={tab === 'gestor' ? 'gestor' : 'REG-12345'}
                    className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 pr-12 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => !state)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-[1.25rem] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? 'Entrando...' : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={handleRecovery}
                  disabled={recoveryBusy}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recoveryBusy ? 'Gerando senha...' : 'Recuperar acesso'}
                </button>
              </form>

              {tab === 'colaborador' && (
                <form onSubmit={submitRegister} className="mt-8 rounded-[1.6rem] border border-indigo-400/20 bg-indigo-500/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <UserPlus className="h-4 w-4 text-indigo-200" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">Criar novo colaborador</h2>
                      <p className="mt-1 text-xs text-indigo-100/70">Cadastro com acesso imediato.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                    <input
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="Cargo"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                    <input
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="Setor"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Senha desejada"
                      className="w-full rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-4 w-full rounded-[1.25rem] bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? 'Cadastrando...' : 'Cadastrar e entrar'}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
