import { Eye, EyeOff, UserPlus } from 'lucide-react';
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
      const payload = { registryId: registryId.trim(), password };
      const result = await login(payload);
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
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="border-b border-slate-800 bg-slate-950/70 p-8 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                {apiStatus === 'connected' ? 'API conectada' : apiStatus === 'error' ? 'API indisponível' : 'Conectando...'}
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-white">Ponto Digital</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Cadastro real, login real, ponto real. O frontend só envia dados para a API e a API decide tudo.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cadastro</p>
                  <p className="mt-2 text-sm text-slate-200">Usuário cria o próprio acesso</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gestor</p>
                  <p className="mt-2 text-sm text-slate-200">Login master: gestor / 12345</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Segurança</p>
                  <p className="mt-2 text-sm text-slate-200">Sessão HTTP-only via backend</p>
                </div>
              </div>
            </section>

            <section className="p-8">
              <div className="grid grid-cols-2 rounded-2xl border border-slate-800 bg-slate-950 p-1 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setTab('colaborador')}
                  className={`rounded-xl px-4 py-3 transition ${tab === 'colaborador' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  Colaborador
                </button>
                <button
                  type="button"
                  onClick={() => setTab('gestor')}
                  className={`rounded-xl px-4 py-3 transition ${tab === 'gestor' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  Gestor
                </button>
              </div>

              {message && (
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  {message}
                </div>
              )}

              <form onSubmit={submitLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {tab === 'gestor' ? 'Registro do gestor' : 'Registro do colaborador'}
                  </label>
                  <input
                    value={registryId}
                    onChange={(e) => setRegistryId(e.target.value)}
                    placeholder={tab === 'gestor' ? 'gestor' : 'REG-12345'}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 pr-12 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((state) => !state)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {busy ? 'Entrando...' : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={handleRecovery}
                  disabled={recoveryBusy}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-indigo-500 hover:text-white disabled:opacity-60"
                >
                  {recoveryBusy ? 'Gerando senha...' : 'Recuperar acesso'}
                </button>
              </form>

              {tab === 'colaborador' && (
                <form onSubmit={submitRegister} className="mt-8 space-y-4 rounded-[1.5rem] border border-indigo-500/20 bg-indigo-500/10 p-5">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-indigo-300" />
                    <h2 className="text-sm font-bold text-white">Criar novo colaborador</h2>
                  </div>

                  <div className="grid gap-4">
                    <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Nome completo" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
                    <input value={regRole} onChange={(e) => setRegRole(e.target.value)} placeholder="Cargo" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
                    <input value={regDepartment} onChange={(e) => setRegDepartment(e.target.value)} placeholder="Setor" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
                    <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Senha desejada" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
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
