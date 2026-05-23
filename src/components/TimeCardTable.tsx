import React, { useState } from 'react';
import { Calendar, AlertCircle, FileSpreadsheet, Plus, HelpCircle, Map, Info, FileDown } from 'lucide-react';
import { DailySummary, TimeEntry, TimeEntryType, GeoLocationData } from '../types';
import { formatMinutes } from '../utils';

interface TimeCardTableProps {
  summaries: DailySummary[];
  onAddManualEntry: (dateString: string, timeString: string, type: TimeEntryType, justification: string) => void;
  employeeName: string;
}

export function TimeCardTable({ summaries, onAddManualEntry, employeeName }: TimeCardTableProps) {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustDate, setAdjustDate] = useState('');
  const [adjustTime, setAdjustTime] = useState('');
  const [adjustType, setAdjustType] = useState<TimeEntryType>('entrada');
  const [justification, setJustification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Export timesheet to CSV format
  const handleExportCSV = () => {
    const headers = ['Data', 'Início (Entrada)', 'S. Almoço', 'R. Almoço', 'Saída Final', 'Total Trabalhado', 'Saldo do Dia', 'Inconformidades'];
    
    const rows = summaries.map(s => {
      // Find entries matching
      const ent = s.entries.find(e => e.type === 'entrada')?.timestamp || '';
      const lOut = s.entries.find(e => e.type === 'almoco_saida')?.timestamp || '';
      const lIn = s.entries.find(e => e.type === 'almoco_retorno')?.timestamp || '';
      const out = s.entries.find(e => e.type === 'saida')?.timestamp || '';

      const formatTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';

      return [
        s.date,
        formatTime(ent),
        formatTime(lOut),
        formatTime(lIn),
        formatTime(out),
        formatMinutes(s.totalWorkMinutes),
        s.isComplete ? formatMinutes(s.overtimeMinutes) : 'Incompleto',
        s.warnings.join(' | ') || 'Certo'
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `folha-de-ponto-${employeeName.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adjustDate || !adjustTime || !justification.trim()) {
      setErrorMsg('Preencha todos os campos obrigatórios e descreva uma justificativa.');
      return;
    }

    onAddManualEntry(adjustDate, adjustTime, adjustType, justification.trim());
    setAdjustDate('');
    setAdjustTime('');
    setJustification('');
    setShowAdjustModal(false);
  };

  const getPunchLabel = (type: TimeEntryType) => {
    switch (type) {
      case 'entrada': return 'Entrada';
      case 'almoco_saida': return 'Almoço Saída';
      case 'almoco_retorno': return 'Almoço Volta';
      case 'saida': return 'Saída';
    }
  };

  const getPunchPillStyle = (type: TimeEntryType) => {
    switch (type) {
      case 'entrada': return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      case 'almoco_saida': return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'almoco_retorno': return 'bg-sky-50 text-sky-700 border-sky-200/50';
      case 'saida': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    }
  };

  const formatDayName = (dateStr: string) => {
    const parts = dateStr.split('-');
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return dt.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  const formatDateHuman = (dateStr: string) => {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6" id="time-card-table-component">
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-indigo-500" />
            Folha de Ponto Mensal
          </h3>
          <p className="text-xs text-gray-500 mt-1">Histórico completo de jornadas e intervalos</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="btn-open-adjust-modal"
            onClick={() => setShowAdjustModal(!showAdjustModal)}
            className="flex-1 sm:flex-initial text-xs font-semibold text-slate-700 border border-gray-200 hover:bg-slate-50 py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            Soluções / Retroativo
          </button>
          <button
            type="button"
            id="btn-export-csv"
            disabled={summaries.length === 0}
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial text-xs font-semibold bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Retroactive Adjust Form inline modal */}
      {showAdjustModal && (
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/50 space-y-4" id="retroactive-adjust-form">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Registrar Ponto Retroativo (Ajuste Manual)</h4>
              <p className="text-xs text-slate-600 mt-0.5">Assegure a conformidade inserindo batidas pendentes.</p>
            </div>
            <button
              onClick={() => setShowAdjustModal(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Fechar x
            </button>
          </div>

          <form onSubmit={handleAdjustSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Data</label>
              <input
                type="date"
                required
                id="adjust-input-date"
                value={adjustDate}
                onChange={(e) => setAdjustDate(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Hora</label>
              <input
                type="time"
                required
                id="adjust-input-time"
                step="60"
                value={adjustTime}
                onChange={(e) => setAdjustTime(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tipo de Ponto</label>
              <select
                id="adjust-select-type"
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as TimeEntryType)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none cursor-pointer"
              >
                <option value="entrada">Entrada (Início)</option>
                <option value="almoco_saida">Saída Almoço (Intervalo)</option>
                <option value="almoco_retorno">Retorno Almoço (Volta)</option>
                <option value="saida">Saída Final (Fim)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Justificativa obrigatória</label>
              <input
                type="text"
                required
                id="adjust-input-just"
                placeholder="Ex: Esquecimento de batida"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none"
              />
            </div>
            {errorMsg && (
              <div className="md:col-span-4 text-xs text-red-600 font-semibold">{errorMsg}</div>
            )}
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                id="btn-confirm-adjust"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition tracking-wide cursor-pointer"
              >
                Gravar Ponto Retroativo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table view */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full border-collapse text-left text-xs text-gray-500" id="timecards-table">
          <thead className="bg-slate-50/80 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4 font-bold">Data / Dia</th>
              <th className="py-3 px-4 font-bold">Registro de Batidas</th>
              <th className="py-3 px-4 font-bold text-center">Horas Registradas</th>
              <th className="py-3 px-4 font-bold text-center">Saldo Diário</th>
              <th className="py-3 px-4 font-bold text-right">Inconformidades / Alertas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summaries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                  Nenhum registro de ponto encontrado para este colaborador.
                </td>
              </tr>
            ) : (
              summaries.map((s) => {
                const isComplete = s.isComplete;
                return (
                  <tr key={s.date} className="hover:bg-slate-50/50 transition duration-150">
                    {/* Date Details */}
                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-gray-900 font-semibold font-mono">{formatDateHuman(s.date)}</span>
                        <span className="text-gray-400 capitalize text-[10px] font-bold">
                          {formatDayName(s.date)}
                        </span>
                      </div>
                    </td>

                    {/* All day's punches inline */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {s.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1 cursor-help ${getPunchPillStyle(entry.type)}`}
                            title={`${getPunchLabel(entry.type)} ${
                              entry.isManual ? `\r\nJustificativa: "${entry.justification}"` : ''
                            } ${
                              entry.location ? `\r\nLocal: ${entry.location.description}` : ''
                            }`}
                          >
                            <span className="font-bold">{getPunchLabel(entry.type).split(' ')[0]}:</span>
                            <span className="font-mono">
                              {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {entry.isManual && (
                              <Info className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total Hours Worked */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-gray-800">
                      {formatMinutes(s.totalWorkMinutes)}
                    </td>

                    {/* Overtime Deviation */}
                    <td className="py-4 px-4 text-center font-mono">
                      {!isComplete ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Pendente
                        </span>
                      ) : s.overtimeMinutes === 0 ? (
                        <span className="text-gray-400">0m</span>
                      ) : s.overtimeMinutes > 0 ? (
                        <span className="text-emerald-600 font-semibold">+{formatMinutes(s.overtimeMinutes)}</span>
                      ) : (
                        <span className="text-rose-500 font-semibold">-{formatMinutes(Math.abs(s.overtimeMinutes))}</span>
                      )}
                    </td>

                    {/* Alerts and warnings */}
                    <td className="py-4 px-4 text-right">
                      {s.warnings.length > 0 ? (
                        <div className="flex flex-col gap-1 items-end">
                          {s.warnings.map((w, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/50 py-0.5 px-2 rounded-full"
                            >
                              <AlertCircle className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded-full border border-emerald-100">
                          Consistente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Help tooltip explaining standard workflow */}
      <div className="bg-slate-50 rounded-xl p-4 flex gap-2.5 border border-slate-100">
        <Info className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal">
          <p className="font-semibold text-slate-800">Tratamento de Inconsistências (Legislação CLT):</p>
          <ul className="list-disc list-inside mt-1 space-y-1 pl-1">
            <li>Os intervalos de alimentação de almoço devem constar com no mínimo 60 minutos de duração.</li>
            <li>Horas trabalhadas acima de 10 horas totais diárias constituem alerta de jornada estendida.</li>
            <li>Use o botão <strong>Soluções / Retroativo</strong> para adicionar qualquer horário esquecido.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
