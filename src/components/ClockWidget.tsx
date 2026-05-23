import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { TimeEntryType, TimeEntry, GeoLocationData } from '../types';

interface ClockWidgetProps {
  onClockIn: (type: TimeEntryType, justification: string, location?: GeoLocationData) => void;
  todayEntries: TimeEntry[];
  employeeName: string;
}

export function ClockWidget({ onClockIn, todayEntries, employeeName }: ClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [justification, setJustification] = useState('');
  const [getLocation, setGetLocation] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>('Buscando localização...');
  const [coords, setCoords] = useState<GeoLocationData | undefined>(undefined);
  const [customType, setCustomType] = useState<TimeEntryType | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch coordinates on mount and watch
  useEffect(() => {
    if (!getLocation) {
      setCoords(undefined);
      setLocationStatus('GPS Desativado (Remoto padrão)');
      return;
    }

    setLocationStatus('Obtendo localização...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            description: `GPS (Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)})`
          });
          setLocationStatus('Localização capturada com sucesso');
        },
        (error) => {
          console.warn('Erro ao obter GPS', error);
          // Fallback to mock HQ coordinates or Remote
          setCoords({
            latitude: -23.55052,
            longitude: -46.633308,
            accuracy: 15,
            description: 'Sede São Paulo (Conexão Segura Escritório)'
          });
          setLocationStatus('Sem sinal GPS - Usando IP Escritório');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setCoords({
        latitude: -23.55052,
        longitude: -46.633308,
        accuracy: 15,
        description: 'Sede São Paulo (Usando IP)'
      });
      setLocationStatus('Geolocalização não suportada');
    }
  }, [getLocation]);

  // Logic to guess the next clock-in action based on today's logs
  const getSuggestedType = (): TimeEntryType => {
    if (todayEntries.length === 0) return 'entrada';
    if (todayEntries.length === 1) return 'almoco_saida';
    if (todayEntries.length === 2) return 'almoco_retorno';
    if (todayEntries.length === 3) return 'saida';
    return 'entrada'; // Cycle restarts or starts another session if they do more than 4
  };

  const currentSuggested = getSuggestedType();
  const selectedType = customType !== null ? customType : currentSuggested;

  const getTypeName = (type: TimeEntryType) => {
    switch (type) {
      case 'entrada': return 'Entrada (Início)';
      case 'almoco_saida': return 'Saída Almoço (Intervalo)';
      case 'almoco_retorno': return 'Retorno Almoço (Volta)';
      case 'saida': return 'Saída Final (Fim)';
    }
  };

  const getButtonColor = (type: TimeEntryType) => {
    switch (type) {
      case 'entrada': return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200';
      case 'almoco_saida': return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200';
      case 'almoco_retorno': return 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200';
      case 'saida': return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200';
    }
  };

  const handlePunch = (e: React.FormEvent) => {
    e.preventDefault();
    onClockIn(selectedType, justification, coords);
    setJustification('');
    setCustomType(null); // Reset back to suggestion for next step
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8" id="clock-widget-container">
      {/* Realtime clock display */}
      <div className="text-center mb-6">
        <h2 className="text-gray-400 font-mono tracking-wider uppercase text-xs mb-1">
          {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        <div className="flex justify-center items-baseline gap-2 font-mono text-5xl font-semibold text-gray-900 tracking-tight">
          <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      <form onSubmit={handlePunch} className="space-y-5">
        {/* Step Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Tipo de Registro
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            {(['entrada', 'almoco_saida', 'almoco_retorno', 'saida'] as TimeEntryType[]).map((type) => {
              const active = selectedType === type;
              const isRecommended = currentSuggested === type && customType === null;
              return (
                <button
                  key={type}
                  type="button"
                  id={`btn-type-${type}`}
                  onClick={() => setCustomType(type)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  } relative`}
                >
                  {getTypeName(type).split(' ')[0]}
                  {isRecommended && (
                    <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {customType && customType !== currentSuggested && (
            <button
              type="button"
              id="btn-reset-suggestion"
              onClick={() => setCustomType(null)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium mt-1 hover:underline cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Voltar ao tipo sugerido do sistema ({getTypeName(currentSuggested)})
            </button>
          )}
        </div>

        {/* Justification input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            Justificativa / Observação <span className="text-gray-400">(Opcional)</span>
          </label>
          <input
            type="text"
            id="input-justification"
            placeholder="Ex: Almoço atrasado por reuniões urgentes, serviço externo, etc."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full text-sm py-2 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 transition"
          />
        </div>

        {/* Location Section */}
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-100">
          <div className="flex gap-2.5 items-start">
            <div className={`p-2 rounded-lg ${coords ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">Audit de Geolocalização</p>
              <p className="text-xs text-gray-500 leading-normal">{coords ? coords.description : locationStatus}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-gray-500">Filtrar GPS real</span>
            <button
              type="button"
              id="toggle-gps"
              onClick={() => setGetLocation(!getLocation)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                getLocation ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  getLocation ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Clock Button */}
        <button
          type="submit"
          id="btn-perform-clockin"
          className={`w-full py-4 px-6 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-opacity-30 transition-all active:scale-[0.99] cursor-pointer cursor-semibold text-lg ${getButtonColor(
            selectedType
          )}`}
        >
          <Clock className="w-5 h-5 animate-pulse" />
          Registrar {getTypeName(selectedType)}
        </button>
      </form>

      {/* Summary of entries Registered Today */}
      {todayEntries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            Registros Efetuados Hoje por {employeeName}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="bg-slate-50 hover:bg-slate-100 transition rounded-lg p-2.5 flex items-center justify-between border border-gray-200/50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {getTypeName(entry.type).split(' ')[0]}
                  </p>
                  <p className="text-sm font-semibold font-mono text-gray-800">
                    {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {entry.isManual && (
                  <span className="text-[9px] bg-amber-50 text-amber-700 py-0.5 px-1.5 rounded-full font-medium border border-amber-200/40">
                    Manual
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
