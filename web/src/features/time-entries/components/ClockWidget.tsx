import { CheckCircle2, TimerReset } from 'lucide-react';
import { useState } from 'react';
import type { TimeEntryType } from '@shared/contracts';

interface ClockWidgetProps {
  onClock: (type: TimeEntryType, justification: string) => Promise<void>;
  disabled?: boolean;
}

const types: { value: TimeEntryType; label: string }[] = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'almoco_saida', label: 'Saída almoço' },
  { value: 'almoco_retorno', label: 'Retorno almoço' },
  { value: 'saida', label: 'Saída' }
];

export function ClockWidget({ onClock, disabled }: ClockWidgetProps) {
  const [justification, setJustification] = useState('');
  const [pendingType, setPendingType] = useState<TimeEntryType>('entrada');
  const [loading, setLoading] = useState(false);

  const submit = async (type: TimeEntryType) => {
    setPendingType(type);
    setLoading(true);
    try {
      await onClock(type, justification);
      setJustification('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Registrar ponto</h3>
          <p className="text-xs text-slate-500">Operação enviada para a API</p>
        </div>
        <TimerReset className="h-5 w-5 text-indigo-600" />
      </div>

      <textarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder="Justificativa opcional"
        className="mb-4 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-indigo-400"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {types.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={disabled || loading}
            onClick={() => submit(item.value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading && pendingType === item.value ? 'Enviando...' : item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
