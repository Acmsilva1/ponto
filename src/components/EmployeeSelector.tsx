import React, { useState } from 'react';
import { Users, Plus, X, Briefcase, Hash, Sparkles } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddEmployee: (employee: Employee) => void;
}

export function EmployeeSelector({ employees, selectedId, onSelect, onAddEmployee }: EmployeeSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(employees.length === 0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [workHours, setWorkHours] = useState(8);

  const selectedEmployee = employees.find(e => e.id === selectedId) || employees[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !department.trim()) return;

    const randomColors = [
      'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-500', 
      'bg-sky-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const avatarColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const registryId = `REG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newWorker: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      workHoursPerDay: Number(workHours),
      avatarColor,
      registryId
    };

    onAddEmployee(newWorker);
    setName('');
    setRole('');
    setDepartment('');
    setWorkHours(8);
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="employee-selector">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-indigo-500" />
          {employees.length === 0 ? 'Criar Novo Perfil' : 'Colaborador Ativo'}
        </h3>
        {employees.length > 0 && (
          <button
            type="button"
            id="btn-toggle-add-employee"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-50 transition cursor-pointer"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showAddForm ? 'Cancelar' : 'Novo Perfil'}
          </button>
        )}
      </div>

      {showAddForm || employees.length === 0 ? (
        <form onSubmit={handleCreate} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Adicionar Colaborador
          </h4>
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Nome Completo</label>
            <input
              type="text"
              id="input-worker-name"
              required
              placeholder="Ex: Amanda Lima"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Cargo</label>
              <input
                type="text"
                id="input-worker-role"
                required
                placeholder="Ex: Gerente Geral"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400">Setor</label>
              <input
                type="text"
                id="input-worker-dept"
                required
                placeholder="Ex: RH"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Jornada Diária (Horas)</label>
            <select
              id="select-worker-hours"
              value={workHours}
              onChange={(e) => setWorkHours(Number(e.target.value))}
              className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="8">8 Horas Diárias (Padrão CLT)</option>
              <option value="6">6 Horas Diárias (Estágio/Jornada Reduzida)</option>
              <option value="4">4 Horas Diárias (Meio período)</option>
            </select>
          </div>
          <button
            type="submit"
            id="btn-submit-employee"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-lg text-xs font-semibold shadow-sm transition tracking-wide cursor-pointer"
          >
            Cadastrar e Começar a Bater Ponto
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Current selected Profile card */}
          {selectedEmployee && (
            <div className="flex items-center gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <div className={`w-12 h-12 rounded-full ${selectedEmployee.avatarColor} text-white flex items-center justify-center font-bold text-lg`}>
                {selectedEmployee.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{selectedEmployee.name}</h4>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {selectedEmployee.role} &bull; <span className="font-medium text-indigo-600">{selectedEmployee.department}</span>
                </p>
                <p className="text-[10px] text-gray-400 font-mono tracking-wide mt-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Registro: {selectedEmployee.registryId} &bull; Jornada: {selectedEmployee.workHoursPerDay}h
                </p>
              </div>
            </div>
          )}

          {/* Quick List selection */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Escolher Outro Colaborador
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1" id="worker-scroll-list">
              {employees.map((worker) => {
                const isActive = worker.id === selectedId;
                return (
                  <button
                    key={worker.id}
                    id={`select-worker-${worker.id}`}
                    type="button"
                    onClick={() => onSelect(worker.id)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold' 
                        : 'bg-white hover:bg-slate-50 border border-transparent text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-6 h-6 rounded-full ${worker.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
                        {worker.name.charAt(0)}
                      </div>
                      <span className="truncate">{worker.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 font-mono shrink-0">
                      {worker.department}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
