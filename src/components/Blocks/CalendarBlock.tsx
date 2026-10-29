import React, { useState } from 'react';
import type { CalendarData, CalendarEvent } from '../../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface CalendarBlockProps {
  calendarData?: CalendarData;
  onChange: (newData: CalendarData) => void;
}

const DEFAULT_CALENDAR: CalendarData = {
  events: [
    { id: 'ev-1', title: 'Reunión de planificación', date: new Date().toISOString().slice(0, 10), color: '#ea580c' },
    { id: 'ev-2', title: 'Entrega de prototipo', date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), color: '#2563eb' },
    { id: 'ev-3', title: 'Revisión con amigo', date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10), color: '#16a34a' },
  ],
};

const DAYS_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CalendarBlock: React.FC<CalendarBlockProps> = ({ calendarData, onChange }) => {
  const data = calendarData && calendarData.events ? calendarData : DEFAULT_CALENDAR;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (dateStr: string) => {
    if (!newEventTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: 'ev-' + Date.now(),
      title: newEventTitle.trim(),
      date: dateStr,
      color: '#ea580c',
    };

    onChange({
      events: [...data.events, newEvent],
    });

    setNewEventTitle('');
    setSelectedDayDate(null);
  };

  const handleDeleteEvent = (id: string) => {
    onChange({
      events: data.events.filter((e) => e.id !== id),
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="my-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] shadow-xs select-none text-xs">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-amber-600 dark:text-amber-400" />
          <span className="font-bold text-sm text-neutral-800 dark:text-neutral-100">
            {monthNames[month]} {year}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-1 text-[11px] rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-neutral-600 dark:text-neutral-300"
          >
            Hoy
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-neutral-400 mb-1">
        {DAYS_NAMES.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty days */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={'empty-' + i} className="min-h-[70px] bg-neutral-50/40 dark:bg-neutral-900/20 rounded-lg" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday =
            new Date().toISOString().slice(0, 10) === dateStr;
          const dayEvents = data.events.filter((e) => e.date === dateStr);

          return (
            <div
              key={'day-' + dayNum}
              className={`group relative min-h-[75px] p-1.5 rounded-lg border transition-colors flex flex-col justify-between ${
                isToday
                  ? 'border-amber-500/80 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-neutral-200/70 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold ${
                    isToday
                      ? 'w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {dayNum}
                </span>

                <button
                  onClick={() => setSelectedDayDate(dateStr)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 transition-opacity"
                  title="Añadir evento"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Events in Day */}
              <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="group/ev flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium truncate"
                    style={{ borderLeft: `2.5px solid ${ev.color || '#ea580c'}` }}
                  >
                    <span className="truncate">{ev.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(ev.id);
                      }}
                      className="hidden group-hover/ev:inline text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add event modal / prompt if day clicked */}
      {selectedDayDate && (
        <div className="mt-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-500 shrink-0">
            Evento para {selectedDayDate}:
          </span>
          <input
            type="text"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            placeholder="Título del evento o tarea..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddEvent(selectedDayDate);
              if (e.key === 'Escape') setSelectedDayDate(null);
            }}
            className="flex-1 px-2.5 py-1 bg-white dark:bg-[#252525] rounded-md border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-100 outline-hidden"
          />
          <button
            onClick={() => handleAddEvent(selectedDayDate)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-medium"
          >
            Añadir
          </button>
          <button
            onClick={() => setSelectedDayDate(null)}
            className="px-2 py-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};
