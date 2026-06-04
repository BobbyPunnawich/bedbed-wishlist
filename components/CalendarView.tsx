"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ChecklistItem, User } from "@/lib/types";
import Avatar from "./Avatar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May",
  "June", "July", "August", "September", "October", "November", "December",
];

interface CalendarViewProps {
  items: ChecklistItem[];
  users: User[];
  activeUser: User;
  onToggleItem: (item: ChecklistItem) => void;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(dateStr: string) {
  // Parse as local date to avoid timezone offset shifting the day
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function itemDateKey(item: ChecklistItem) {
  return item.planned_date ? item.planned_date.toString().split("T")[0] : null;
}

export default function CalendarView({ items, users, activeUser, onToggleItem }: CalendarViewProps) {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Group planned items by date key
  const byDate: Record<string, ChecklistItem[]> = {};
  items.forEach(item => {
    const key = itemDateKey(item);
    if (!key) return;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(item);
  });

  // Calendar grid
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Upcoming: planned, not completed, sorted by date
  const upcoming = items
    .filter(i => i.planned_date && !i.is_completed)
    .sort((a, b) => itemDateKey(a)!.localeCompare(itemDateKey(b)!));

  const selectedItems = selectedDate ? (byDate[selectedDate] ?? []) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-4">
      {/* Calendar card */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        {/* Month header */}
        <div className="flex items-center justify-between px-5 py-4 bg-purple-50/60">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-purple-100 text-purple-400 active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-purple-800">{MONTHS[viewMonth]} {viewYear}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-purple-100 text-purple-400 active:scale-90 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-purple-300 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const dayItems = byDate[dateStr] ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const pending = dayItems.filter(x => !x.is_completed).length;
            const done = dayItems.filter(x => x.is_completed).length;

            return (
              <button
                key={i}
                onClick={() => dayItems.length > 0 && setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center py-2 rounded-2xl transition-all active:scale-90 ${
                  isSelected
                    ? "bg-purple-400"
                    : isToday
                    ? "ring-2 ring-purple-300"
                    : dayItems.length > 0
                    ? "hover:bg-purple-50"
                    : ""
                }`}
              >
                <span className={`leading-none font-medium ${
                  isSelected ? "text-white" :
                  isToday ? "text-purple-600 font-bold" :
                  dayItems.length > 0 ? "text-purple-700" : "text-purple-300"
                }`}>
                  {day}
                </span>
                {dayItems.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {pending > 0 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-purple-400"}`} />
                    )}
                    {done > 0 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-purple-200" : "bg-purple-200"}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pb-4 text-xs text-purple-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-200" />
            <span>Done</span>
          </div>
        </div>
      </div>

      {/* Upcoming plans */}
      {upcoming.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider px-1">Upcoming Plans</p>
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden divide-y divide-purple-50">
            {upcoming.map(item => {
              const creator = users.find(u => u.id === item.created_by);
              const key = itemDateKey(item)!;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    onClick={() => onToggleItem(item)}
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-purple-300 hover:border-purple-400 active:scale-90 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-purple-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-purple-400">{formatDisplay(key)}</span>
                      {creator && (
                        <div className="flex items-center gap-1">
                          <Avatar url={creator.avatar_url} nickname={creator.nickname} size="sm" />
                          <span className="text-xs text-purple-400">{creator.nickname}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">📅</div>
          <p className="font-semibold text-purple-500">No plans yet</p>
          <p className="text-purple-300">Tap the 📅 button on any checklist item to set a date</p>
        </div>
      )}

      {/* Day bottom sheet */}
      {selectedDate && selectedItems.length > 0 && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedDate(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-purple-50">
              <div>
                <p className="font-semibold text-purple-800">{formatDisplay(selectedDate)}</p>
                <p className="text-xs text-purple-400">
                  {selectedItems.filter(i => !i.is_completed).length} planned ·{" "}
                  {selectedItems.filter(i => i.is_completed).length} done
                </p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-2 rounded-xl hover:bg-purple-50 text-purple-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-1 max-h-72 overflow-y-auto pb-safe">
              {selectedItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50 active:bg-purple-50 transition-colors">
                  <button
                    onClick={() => onToggleItem(item)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                      item.is_completed ? "bg-purple-400 border-purple-400" : "border-purple-300 hover:border-purple-400"
                    }`}
                  >
                    {item.is_completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${item.is_completed ? "line-through text-purple-300" : "text-purple-800"}`}>
                      {item.title}
                    </p>
                    {item.created_by_nickname && (
                      <p className="text-xs text-purple-400">{item.created_by_nickname}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
