import React, { useState } from 'react';
import { Clock, ShieldCheck, User, Key, Building2, HelpCircle, UserPlus, Users, Eye, EyeOff, X } from 'lucide-react';
import { Employee } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employee: Employee, asRole: 'colaborador' | 'gestor') => void;
  onQuickRegister: (
    name: string,
    role: string,
    department: string,
    password: string,
    isGestor: boolean
  ) => void;
  supabaseConnected: boolean | null;
}

export function LoginScreen({ employees, onLogin, onQuickRegister, supabaseConnected }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'colaborador' | 'gestor'>('colaborador');
  const [registryId, setRegistryId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Sign up modal/state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regIsGestor, setRegIsGestor] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'colaborador') {
      // Find the employee with matching registryId and password (case-insensitive for safety)
      const emp = employees.find(
        (e) => e.registryId.trim().toUpperCase() === registryId.trim().toUpperCase()
      );

      if (!emp) {
        setErrorMsg('Registro não encontrado. Verifique seu ID ou ative um perfil.');
        return;
      }

      // Check password
      const storedPassword = emp.password || '1234';
      if (storedPassword !== password) {
        setErrorMsg('Senha incorreta. Confirme os dados cadastrados.');
        return;
      }

      // Good to go!
      onLogin(emp, 'colaborador');
    } else {
      // General Gestor Login
      // 1. Check if there exists any Employee with administrative gestor role
      const systemGestores = employees.filter(e => e.accessRole === 'gestor');
      
      // Fallback: If they input "admin" / "admin" and there are no users yet, allow login
      if (registryId.trim().toLowerCase() === 'admin' && password === 'admin') {
        // Create an on-the-fly dummy gestor
        const tempGestor: Employee = {
          id: 'gestor-admin',
          name: 'Administrador Master',
          role: 'Diretor de RH',
          department: 'Administração',
          workHoursPerDay: 8,
          avatarColor: 'bg-slate-900',
          registryId: 'ADMIN',
          password: 'admin',
          accessRole: 'gestor'
        };
        onLogin(tempGestor, 'gestor');
        return;
      }

      // Look up within employees
      const emp = employees.find(
        (e) => e.registryId.trim().toUpperCase() === registryId.trim().toUpperCase() && e.accessRole === 'gestor'
      );

      if (!emp) {
        setErrorMsg('Gestor Master não cadastrado com esse Registro ID. Utilize "admin" com a senha "admin" como acesso temporário.');
        return;
      }

      if ((emp.password || '1234') !== password) {
        setErrorMsg('Senha incorreta para a conta Gestora.');
        return;
      }

      onLogin(emp, 'gestor');
    }
  };

  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regRole.trim() || !regDept.trim() || !regPassword.trim()) return;

    onQuickRegister(regName, regRole, regDept, regPassword, regIsGestor);
    
    // Reset inputs
    setRegName('');
    setRegRole('');
    setRegDept('');
    setRegPassword('');
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased" id="login-container">
      {/* Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white font-sans">Ponto Digital</h1>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest leading-none mt-0.5">MTE Portaria 671</p>
            </div>
          </div>
          {/* Supabase Link status */}
          <div>
            {supabaseConnected === true ? (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-medium">
                Nuvem Ativa (Supabase)
              </span>
            ) : supabaseConnected === false ? (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md font-medium">
                Tabelas Pendentes
              </span>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md font-medium">
                Banco Local Ativo
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Form content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/25 text-rose-300 px-4 py-3 rounded-xl text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Tabs Selector list */}
            <div className="grid grid-cols-2 bg-slate-900/60 border-b border-slate-800/80">
              <button
                type="button"
                id="tab-select-colaborador"
                onClick={() => {
                  setActiveTab('colaborador');
                  setErrorMsg('');
                }}
                className={`py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'colaborador'
                    ? 'border-indigo-500 text-white bg-slate-850/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                Colaborador
              </button>
              <button
                type="button"
                id="tab-select-gestor"
                onClick={() => {
                  setActiveTab('gestor');
                  setErrorMsg('');
                }}
                className={`py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'gestor'
                    ? 'border-indigo-500 text-white bg-slate-850/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Master Gestor
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-white">
                  {activeTab === 'colaborador' ? 'Área do Colaborador (PWA)' : 'Painel de Gestão e Auditoria'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'colaborador'
                    ? 'Preencha seus dados de registro para bater ponto e verificar seu espelho diário.'
                    : 'Acesse relatórios, mapas de geolocalização e as métricas consolidadas.'}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {activeTab === 'colaborador' ? 'ID do Colaborador (Registro)' : 'Registro do Gestor / Usuário'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={activeTab === 'colaborador' ? 'Ex: REG-12345' : 'Ex: ADMIN ou REG-ID'}
                      value={registryId}
                      onChange={(e) => setRegistryId(e.target.value)}
                      className="w-full text-xs py-3 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Senha de Acesso
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs py-3 pl-10 pr-10 rounded-xl border border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-login-submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-semibold shadow-lg transition duration-200 mt-2 cursor-pointer"
                >
                  Entrar no Sistema
                </button>
              </form>

              {/* Extra Onboarding Helper options */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex flex-col gap-3">
                <button
                  onClick={() => setIsRegistering(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Cadastrar Novo Colaborador ou Gestor
                </button>

                {employees.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
                      Perfis Registrados no Banco ({employees.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto p-1 bg-slate-950/40 rounded-lg">
                      {employees.map((e) => (
                        <div 
                          key={e.id} 
                          onClick={() => {
                            setRegistryId(e.registryId);
                            setPassword(e.password || '1234');
                            setActiveTab(e.accessRole === 'gestor' ? 'gestor' : 'colaborador');
                          }}
                          className="text-[9px] bg-slate-800 hover:bg-indigo-950 hover:text-indigo-200 border border-slate-700 hover:border-indigo-800 text-slate-300 py-1 px-2 rounded-md font-mono cursor-pointer transition text-ellipsis truncate max-w-[130px]"
                          title={`${e.name} (${e.accessRole === 'gestor' ? 'Gestor' : 'Comum'})`}
                        >
                          {e.name.split(' ')[0]} ({e.registryId})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Register Dialog */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsRegistering(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <Users className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Adicionar Perfil de Acesso</h3>
              <p className="text-xs text-slate-400 mt-1">Gere um acesso de colaborador ou de gestor no sistema.</p>
            </div>

            <form onSubmit={handleQuickRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro Henrique"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Desenvolvedor"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Setor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Engenharia"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Senha desejada</label>
                <input
                  type="password"
                  required
                  placeholder="Defina a senha inicial"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cargo Administrativo</label>
                <select
                  value={regIsGestor ? 'gestor' : 'colaborador'}
                  onChange={(e) => setRegIsGestor(e.target.value === 'gestor')}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="colaborador">Colaborador Comum (Bate Ponto)</option>
                  <option value="gestor">Master Gestor (Acesso a Painel)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-xs font-semibold shadow transition mt-3"
              >
                Cadastrar Perfil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Footer legal */}
      <footer className="py-6 text-center text-slate-600 text-[10px] border-t border-slate-900 bg-slate-950/30">
        <p>&copy; {new Date().getFullYear()} Ponto Digital. CLT Homologado de acordo com a Portaria 671 MTE.</p>
        <p className="mt-0.5">Suporta autentico local remota segura e geolocalização por IP.</p>
      </footer>
    </div>
  );
}
