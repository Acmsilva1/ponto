import React from 'react';
import { Award, Timer, ClipboardCheck, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { DailySummary, Employee } from '../types';
import { formatMinutes, formatOvertimeBalance } from '../utils';

interface DashboardStatsProps {
  summaries: DailySummary[];
  employee: Employee;
}

export function DashboardStats({ summaries, employee }: DashboardStatsProps) {
  // Filters or cumulative variables
  const totalDays = summaries.length;
  
  const totalWorkMins = summaries.reduce((acc, curr) => acc + curr.totalWorkMinutes, 0);
  
  // Accumulated Bank of Hours balance (only including complete days to avoid skewing negative)
  const totalOvertimeMins = summaries.reduce((acc, curr) => {
    if (curr.isComplete) {
      return acc + curr.overtimeMinutes;
    }
    return acc;
  }, 0);

  // Conformance Calculation
  const daysWithWarnings = summaries.filter(s => s.warnings.length > 0).length;
  const complianceRate = totalDays > 0 
    ? Math.round(((totalDays - daysWithWarnings) / totalDays) * 100) 
    : 100;

  // Average workday
  const completedDays = summaries.filter(s => s.isComplete && s.totalWorkMinutes > 0);
  const avgWorkMins = completedDays.length > 0
    ? Math.round(completedDays.reduce((acc, curr) => acc + curr.totalWorkMinutes, 0) / completedDays.length)
    : employee.workHoursPerDay * 60;

  // Overtime balance details
  const balance = formatOvertimeBalance(totalOvertimeMins);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-grid">
      {/* Hours Balance Card */}
      <div className={`rounded-xl p-5 border flex flex-col justify-between transition hover:-translate-y-0.5 shadow-xs bg-white text-gray-800 border-gray-100`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saldo Banco de Horas</p>
            <h3 className="text-2xl font-bold font-mono tracking-tight mt-1">{balance.text}</h3>
          </div>
          <span className={`p-2 rounded-lg text-xs font-bold font-mono border ${balance.colorClass}`}>
            B.H.
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-normal">
          {totalOvertimeMins > 0 
            ? 'Você possui horas de crédito para folga ou compensação.' 
            : totalOvertimeMins < 0 
              ? 'Você possui horas de débito pendentes de compensação.' 
              : 'Nenhuma hora pendente este mês.'}
        </p>
      </div>

      {/* Total Worked Hours Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col justify-between transition hover:-translate-y-0.5 shadow-xs">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Horas Trabalhadas</p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-gray-900 mt-1">{formatMinutes(totalWorkMins)}</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
            <Timer className="w-4.5 h-4.5" />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Acumulado em <span className="font-semibold text-gray-700 font-mono">{totalDays}</span> {totalDays === 1 ? 'dia registrado' : 'dias registrados'}.
        </p>
      </div>

      {/* Productive Workday Average */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col justify-between transition hover:-translate-y-0.5 shadow-xs">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jornada Média Diária</p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-gray-900 mt-1">{formatMinutes(avgWorkMins)}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
            <Activity className="w-4.5 h-4.5" />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Contrato de de <span className="font-semibold text-gray-700 font-mono">{employee.workHoursPerDay}h</span> por dia útil.
        </p>
      </div>

      {/* Compliance / Alerts Score */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col justify-between transition hover:-translate-y-0.5 shadow-xs">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Índice de Conformidade</p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-gray-900 mt-1">{complianceRate}%</h3>
          </div>
          <div className={`p-2 rounded-lg ${complianceRate >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <ClipboardCheck className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                complianceRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {daysWithWarnings > 0 
            ? `${daysWithWarnings} ${daysWithWarnings === 1 ? 'dia contém' : 'dias contêm'} inconformidades de jornada.`
            : 'Nenhuma inconformidade de ponto.'}
        </p>
      </div>
    </div>
  );
}
