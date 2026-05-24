import { Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Employee } from '@shared/contracts';
import { login, recoverPassword } from '../services/authService.js';

interface LoginPageProps {
  onLogin: (employee: Employee, token?: string) => Promise<void> | void;
  apiStatus: 'idle' | 'connected' | 'error';
}

export function LoginPage({ onLogin, apiStatus }: LoginPageProps) {
  const [tab, setTab] = useState<'colaborador' | 'gestor'>('colaborador');
  const [registryId, setRegistryId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  useEffect(() => {
    setRegistryId('');
    setPassword('');
    setShowPassword(false);
    setMessage('');
  }, [tab]);

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
      setMessage(`Senha provisória gerada para ${result.employee.name}. Entre com ela e troque no perfil.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao recuperar acesso.');
    } finally {
      setRecoveryBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/85 shadow-[0_30px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-8 py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
            <span className={`h-2 w-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-400' : apiStatus === 'error' ? 'bg-rose-400' : 'bg-amber-300'}`} />
            {apiStatus === 'connected' ? 'API conectada' : apiStatus === 'error' ? 'API indisponível' : 'Conectando...'}
          </div>

          <h1 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-5xl">Ponto Digital</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-400">
            Acesse com seu registro e senha. O colaborador registra ponto e o gestor tem visão administrativa.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-8">
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

          {message && <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">{message}</div>}

          <form onSubmit={submitLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {tab === 'gestor' ? 'Registro do gestor master' : 'Registro do colaborador'}
              </label>
              <input
                value={registryId}
                onChange={(e) => setRegistryId(e.target.value)}
                placeholder={tab === 'gestor' ? 'GESTOR' : 'REG-12345'}
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

          {tab === 'gestor' && (
            <div className="mt-6 rounded-[1.35rem] border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-50">
              <div className="flex items-center gap-2 font-semibold">
                <Fingerprint className="h-4 w-4" />
                Cadastro de colaboradores
              </div>
              <p className="mt-2 leading-6 text-indigo-50/80">
                Depois de entrar como gestor, você cadastra novos colaboradores no painel administrativo.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              O gestor é o único perfil que cadastra colaboradores.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
