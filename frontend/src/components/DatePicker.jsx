import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Clock, Sun, Moon } from 'lucide-react';
import ValidationMessage from './ValidationMessage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');

export function formatDateDDMMYYYY(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    const d = new Date(date);
    if (!isNaN(d)) return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    return date;
  }
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function toISODate(date) {
  if (!date) return null;
  if (typeof date === 'string') return date.slice(0, 10);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function SingleCalendarModal({
  open,
  onClose,
  value,
  onSelect,
  minDate,
  disabledBefore,
  label = 'Select date',
}) {
  const [viewDate, setViewDate] = useState(() => (value instanceof Date && !isNaN(value) ? value : new Date()));
  const [focused, setFocused] = useState(() => (value instanceof Date && !isNaN(value) ? value : new Date()));
  const containerRef = useRef(null);

  const effectiveMin = minDate ? startOfDay(minDate) : null;
  const disabledLimit = disabledBefore ? addDays(startOfDay(disabledBefore), 1) : null;

  useEffect(() => {
    if (!open) return;
    if (value instanceof Date && !isNaN(value)) {
      setViewDate(value);
      setFocused(value);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const isDisabled = (day) => {
    if (effectiveMin && day < effectiveMin) return true;
    if (disabledLimit && day < disabledLimit) return true;
    return false;
  };

  const handleDayClick = (day) => {
    if (isDisabled(day)) return;
    onSelect(day);
    onClose();
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

  const years = [];
  const baseYear = new Date().getFullYear();
  for (let y = baseYear - 1; y <= baseYear + 5; y++) years.push(y);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label={label}
      className="absolute top-full left-0 z-50 mt-2 w-72 rounded-2xl border border-white/15 bg-ink-900 shadow-2xl shadow-black/80 p-3.5 backdrop-blur-xl"
    >
      {/* Header / navigation */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <button
          type="button"
          onClick={() => setViewDate((v) => addMonths(v, -1))}
          className="p-1.5 rounded-lg text-cream/70 hover:bg-white/10 hover:text-white transition"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          <select
            value={viewDate.getMonth()}
            onChange={(e) => setViewDate((v) => new Date(v.getFullYear(), Number(e.target.value), 1))}
            className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:border-safari-500"
            aria-label="Select month"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i} className="bg-ink-900 text-white">
                {m}
              </option>
            ))}
          </select>
          <select
            value={viewDate.getFullYear()}
            onChange={(e) => setViewDate((v) => new Date(Number(e.target.value), v.getMonth(), 1))}
            className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:border-safari-500"
            aria-label="Select year"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-ink-900 text-white">
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setViewDate((v) => addMonths(v, 1))}
          className="p-1.5 rounded-lg text-cream/70 hover:bg-white/10 hover:text-white transition"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-cream/40 uppercase mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {buildCells().map((day, i) => {
          const inMonth = day.getMonth() === viewDate.getMonth();
          const disabled = isDisabled(day);
          const selected = value instanceof Date && isSameDay(day, value);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className={`h-8 w-full rounded-lg text-xs flex items-center justify-center transition font-medium ${
                disabled
                  ? 'text-cream/20 cursor-not-allowed'
                  : selected
                  ? 'bg-safari-600 text-white font-bold shadow-md shadow-safari-900/50'
                  : inMonth
                  ? 'text-cream hover:bg-white/10'
                  : 'text-cream/35 hover:bg-white/5'
              } ${isToday && !selected ? 'ring-1 ring-safari-400 text-safari-300 font-semibold' : ''}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-[11px]">
        <button
          type="button"
          onClick={() => handleDayClick(startOfDay(new Date()))}
          className="font-semibold text-safari-400 hover:text-safari-300 transition"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          className="text-cream/50 hover:text-sunset-400 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default function DatePicker(props) {
  // Support both dual mode (startDate, endDate) and single mode (value, onChange)
  const isDual = 'startDate' in props || 'endDate' in props || 'onStartDateChange' in props;

  if (isDual) {
    const {
      startDate = null,
      endDate = null,
      onStartDateChange = () => {},
      onEndDateChange = () => {},
      minDate = new Date(),
      error = null,
    } = props;

    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    // Calculate Days and Nights dynamically
    const duration = useMemo(() => {
      if (!startDate || !endDate) return null;
      const s = startOfDay(new Date(startDate));
      const e = startOfDay(new Date(endDate));
      const diffMs = e.getTime() - s.getTime();
      if (diffMs < 0) return null;
      const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const days = nights + 1;
      return { days, nights };
    }, [startDate, endDate]);

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Date */}
          <div className="relative">
            <span className="block text-[11px] font-semibold text-cream/60 uppercase tracking-wider mb-1">
              Start Date
            </span>
            <div
              onClick={() => {
                setOpenStart(true);
                setOpenEnd(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-ink-900 border border-white/10 hover:border-safari-500/50 rounded-2xl cursor-pointer text-sm transition"
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-4 h-4 text-safari-400 shrink-0" />
                <span className={startDate ? 'text-white font-medium' : 'text-cream/40'}>
                  {startDate ? formatDateDDMMYYYY(startDate) : 'Select start'}
                </span>
              </div>
              {startDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartDateChange(null);
                  }}
                  className="text-cream/40 hover:text-sunset-400 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <SingleCalendarModal
              open={openStart}
              onClose={() => setOpenStart(false)}
              value={startDate}
              onSelect={(d) => {
                onStartDateChange(d);
                // If end date is before new start date, update end date
                if (d && endDate && d > endDate) {
                  onEndDateChange(d);
                }
              }}
              minDate={minDate}
              label="Select start date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <span className="block text-[11px] font-semibold text-cream/60 uppercase tracking-wider mb-1">
              End Date
            </span>
            <div
              onClick={() => {
                setOpenEnd(true);
                setOpenStart(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-ink-900 border border-white/10 hover:border-safari-500/50 rounded-2xl cursor-pointer text-sm transition"
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-4 h-4 text-sunset-400 shrink-0" />
                <span className={endDate ? 'text-white font-medium' : 'text-cream/40'}>
                  {endDate ? formatDateDDMMYYYY(endDate) : 'Select end'}
                </span>
              </div>
              {endDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEndDateChange(null);
                  }}
                  className="text-cream/40 hover:text-sunset-400 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <SingleCalendarModal
              open={openEnd}
              onClose={() => setOpenEnd(false)}
              value={endDate}
              onSelect={(d) => onEndDateChange(d)}
              minDate={startDate || minDate}
              label="Select end date"
            />
          </div>
        </div>

        {/* Dynamic Days & Nights Result Badge */}
        {duration && (
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-safari-600/15 border border-safari-500/30 text-safari-300 w-fit animate-fadeIn">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>{duration.days} {duration.days === 1 ? 'Day' : 'Days'}</span>
            <span className="text-cream/30">·</span>
            <Moon className="w-3.5 h-3.5 text-indigo-300" />
            <span>{duration.nights} {duration.nights === 1 ? 'Night' : 'Nights'}</span>
          </div>
        )}

        <ValidationMessage message={error} />
      </div>
    );
  }

  // Single date picker mode
  const {
    value = null,
    onChange = () => {},
    minDate = null,
    disabledBefore = null,
    label = 'Date',
    placeholder = 'Select date',
    error = null,
    id,
  } = props;

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-cream/70 uppercase flex items-center gap-1 mb-1">
          <Calendar className="w-3.5 h-3.5 text-safari-400" /> {label}
        </label>
      )}
      <div
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-ink-900 border rounded-2xl cursor-pointer text-sm transition ${
          error ? 'border-rose-500/70' : open ? 'border-safari-500 ring-1 ring-safari-500/30' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="w-4 h-4 text-safari-400 shrink-0" />
          <span className={value ? 'text-white' : 'text-cream/40'}>
            {value ? formatDateDDMMYYYY(value) : placeholder}
          </span>
        </div>
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="text-cream/40 hover:text-sunset-400 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronRight className={`w-3.5 h-3.5 text-cream/40 transition-transform ${open ? 'rotate-90' : ''}`} />
        )}
      </div>

      <SingleCalendarModal
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        onSelect={(d) => onChange(d)}
        minDate={minDate}
        disabledBefore={disabledBefore}
        label={label}
      />

      <ValidationMessage message={error} id={id ? `${id}-error` : undefined} />
    </div>
  );
}
