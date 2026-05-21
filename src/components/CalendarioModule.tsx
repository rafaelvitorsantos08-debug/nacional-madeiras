import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocalStorage } from './EstoqueModule';

function getEaster(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getHolidays(year: number): Record<string, string> {
  const easter = getEaster(year);
  
  const carnaval = new Date(easter);
  carnaval.setDate(easter.getDate() - 47);

  const paixao = new Date(easter);
  paixao.setDate(easter.getDate() - 2);
  
  const corpus = new Date(easter);
  corpus.setDate(easter.getDate() + 60);

  const format = (d: Date) => {
    // Return format YYYY-MM-DD local time to avoid timezone shifts
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  };

  return {
    [`${year}-01-01`]: 'Confraternização Universal',
    [`${year}-01-20`]: 'São Sebastião (RJ)',
    [format(carnaval)]: 'Carnaval',
    [format(paixao)]: 'Paixão de Cristo',
    [`${year}-04-21`]: 'Tiradentes',
    [`${year}-04-23`]: 'São Jorge (RJ)',
    [`${year}-05-01`]: 'Dia do Trabalhador',
    [format(corpus)]: 'Corpus Christi',
    [`${year}-09-07`]: 'Independência',
    [`${year}-10-12`]: 'Nossa Sra. Aparecida',
    [`${year}-11-02`]: 'Finados',
    [`${year}-11-15`]: 'Proclamação da República',
    [`${year}-11-20`]: 'Consciência Negra',
    [`${year}-12-25`]: 'Natal',
  };
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export interface Lembrete {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  completed: boolean;
}

export function CalendarioModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [lembretes, setLembretes] = useLocalStorage<Lembrete[]>('nm_lembretes', []);
  const [newText, setNewText] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    setHolidays(getHolidays(year));
  }, [year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const selectedDateStr = selectedDate ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth()+1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}` : '';

  const addLembrete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !selectedDateStr) return;
    const nl: Lembrete = {
      id: Date.now().toString(),
      date: selectedDateStr,
      text: newText,
      completed: false
    };
    setLembretes(prev => [...(prev || []), nl]);
    setNewText('');
  };

  const removeLembrete = (id: string) => {
    setLembretes(prev => (prev || []).filter(l => l.id !== id));
  };

  const toggleLembrete = (id: string) => {
    setLembretes(prev => (prev || []).map(l => l.id === id ? { ...l, completed: !l.completed } : l));
  };

  const selectedLembretes = lembretes.filter(l => l.date === selectedDateStr);
  const selectedHoliday = holidays[selectedDateStr];

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
    }
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const isSelected = selectedDateStr === dateStr;
      const isToday = todayStr === dateStr;
      const dayHolidays = holidays[dateStr];
      const hasLembretes = lembretes.some(l => l.date === dateStr && !l.completed);
      
      days.push(
        <div 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={cn(
            "p-2 min-h-[80px] border border-gray-100 cursor-pointer transition-colors relative group",
            isSelected ? "bg-brand-green/10 border-brand-green/30" : "hover:bg-gray-50 bg-white",
            isToday && !isSelected && "bg-blue-50"
          )}
        >
          <span className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            isSelected ? "bg-brand-green text-white" : isToday ? "bg-blue-600 text-white" : "text-gray-700"
          )}>
            {d}
          </span>
          
          <div className="mt-1 flex flex-col space-y-1">
             {dayHolidays && (
                <span className="text-[10px] leading-tight text-orange-600 bg-orange-50 px-1 py-0.5 rounded truncate" title={dayHolidays}>
                  {dayHolidays}
                </span>
             )}
             {hasLembretes && (
                <span className="flex items-center space-x-1 text-[10px] text-brand-green font-medium">
                  <Bell className="w-3 h-3" />
                  <span>Lembretes</span>
                </span>
             )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-green" />
            Calendário & Lembretes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe datas importantes e adicione anotações.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{MONTHS[month]} de {year}</h2>
            <div className="flex space-x-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft className="w-5 h-5"/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 rounded-lg">Hoje</button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="bg-gray-50 text-center py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 border-l border-r border-b border-gray-200">
             {renderCalendar()}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px] lg:h-auto">
          {selectedDate ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800">
                  {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
                </h3>
                {selectedHoliday && (
                  <p className="text-sm text-orange-600 font-medium mt-1">{selectedHoliday}</p>
                )}
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Lembretes do dia</h4>
                {selectedLembretes.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhum lembrete para esta data.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedLembretes.map(lembrete => (
                      <li key={lembrete.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm group">
                        <input 
                          type="checkbox" 
                          checked={lembrete.completed}
                          onChange={() => toggleLembrete(lembrete.id)}
                          className="mt-1 w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                        />
                        <span className={cn("text-sm flex-1", lembrete.completed ? "line-through text-gray-400" : "text-gray-700")}>
                          {lembrete.text}
                        </span>
                        <button onClick={() => removeLembrete(lembrete.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 border-t border-gray-100">
                <form onSubmit={addLembrete} className="flex gap-2">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Adicionar lembrete..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-sm outline-none"
                  />
                  <button type="submit" disabled={!newText.trim()} className="p-2 bg-brand-green text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>Selecione uma data no calendário para ver e adicionar lembretes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
