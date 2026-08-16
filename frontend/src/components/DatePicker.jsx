import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ValidationMessage from './ValidationMessage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');

export function formatDateDDMMYYYY(date) {
  if (!date) return '';
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function toISODate(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function DatePicker({
  value = null,
  onChange,
  minDate = null,
  disabledBefore = null,
  label,
  placeholder = 'Select date',
  error = null,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value || new Date());
  const [focused, setFocused] = useState(() => value || new Date());
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  const effectiveMin = minDate ? startOfDay(minDate) : null;
  const disabledLimit = disabledBefore ? addDays(startOfDay(disabledBefore), 1) : null;

  useEffect(() => {
    if (!open) return;
    setViewDate(value || new Date());
    setFocused(value || new Date());
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isDisabled = (day) => {
    if (effectiveMin && day < effectiveMin) return true;
    if (disabledLimit && day < disabledLimit) return true;
    return false;
  };

  const handleSelect = (day) => {
    if (isDisabled(day)) return;
    onChange(day);
    setOpen(false);
  };

  const buildCells = () => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const offset = first.getDay();
    const start = addDays(first, -offset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      cells.push(addDays(start, i));
    }
    return cells;
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    let next = null;
    switch (e.key) {
      case 'ArrowLeft': next = addDays(focused, -1); break;
      case 'ArrowRight': next = addDays(focused, 1); break;
      case 'ArrowUp': next = addDays(focused, -7); break;
      case 'ArrowDown': next = addDays(focused, 7); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isDisabled(focused)) onChange(focused);
        setOpen(false);
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocused(next);
    setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const years = [];
  const baseYear = new Date().getFullYear();
  for (let y = baseYear - 10; y <= baseYear + 10; y++) years.push(y);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" /> {label}
      </label>
      <div
        className={`mt-1 w-full flex items-center gap-2 bg-[#0b0f19] border rounded-xl text-sm transition ${
          error
            ? 'border-rose-500/70'
            : open
            ? 'border-indigo-500'
            : 'border-slate-800 hover:border-slate-600'
        }`}
      >
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${label}: ${value ? formatDateDDMMYYYY(value) : placeholder}`}
          className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0 text-left"
        >
          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className={`truncate ${value ? 'text-white' : 'text-slate-500'}`}>
            {value ? formatDateDDMMYYYY(value) : placeholder}
          </span>
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate-500 hover:text-rose-400 p-2 mr-1 transition"
            aria-label={`Clear ${label}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="pr-3 text-slate-600">
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
          </span>
        )}
      </div>

      <ValidationMessage message={error} id={id ? `${id}-error` : undefined} />

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute z-50 mt-2 w-72 rounded-2xl border border-slate-700 bg-[#121827] shadow-2xl shadow-black/50 p-3"
        >
          {/* Header / navigation */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <button
              type="button"
              onClick={() => setViewDate((v) => addMonths(v, -1))}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={viewDate.getMonth()}
                onChange={(e) => setViewDate((v) => new Date(v.getFullYear(), Number(e.target.value), 1))}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                aria-label="Select month"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={viewDate.getFullYear()}
                onChange={(e) => setViewDate((v) => new Date(Number(e.target.value), v.getMonth(), 1))}
                className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                aria-label="Select year"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setViewDate((v) => addMonths(v, 1))}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 uppercase mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div ref={gridRef} className="grid grid-cols-7 gap-0.5">
            {buildCells().map((day, i) => {
              const inMonth = day.getMonth() === viewDate.getMonth();
              const disabled = isDisabled(day);
              const selected = isSameDay(day, value);
              const isToday = isSameDay(day, new Date());
              const isFocused = isSameDay(day, focused);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(day)}
                  onMouseEnter={() => setFocused(day)}
                  className={`h-8 w-full rounded-lg text-xs flex items-center justify-center transition ${
                    disabled
                      ? 'text-slate-700 cursor-not-allowed'
                      : selected
                      ? 'bg-indigo-600 text-white font-bold shadow-md'
                      : inMonth
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-800'
                  } ${isToday && !selected ? 'ring-1 ring-indigo-500 text-indigo-300 font-semibold' : ''} ${
                    isFocused && !selected && !disabled ? 'bg-slate-800' : ''
                  }`}
                  aria-label={formatDateDDMMYYYY(day)}
                  aria-selected={selected}
                  aria-disabled={disabled}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => handleSelect(startOfDay(new Date()))}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              Today
            </button>
            <span className="text-[10px] text-slate-600">Format: DD-MM-YYYY</span>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
