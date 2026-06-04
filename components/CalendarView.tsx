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
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
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

  // Calendar grid cells
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Upcoming: planned + not completed, sorted by date
  const upcoming = items
    .filter(i => i.planned_date && !i.is_completed)
    .sort((a, b) => itemDateKey(a)!.localeCompare(itemDateKey(b)!));

  const selectedItems = selectedDate ? (byDate[selectedDate] ?? []) : [];

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-4">
        {/* Calendar card */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4 bg-purple-50/60">
            <button
              onClick={prevMonth}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-purple-100 text-purple-400 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-purple-800">{MONTHS[viewMonth]} {viewYear}</h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-purple-100 text-purple-400 active:scale-90 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-2 pt-3 pb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-purple-300 py-1">
                {d.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* Day cells — min 44px height for mobile tap targets */}
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="h-11" />;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const dayItems = byDate[dateStr] ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasPending = dayItems.some(x => !x.is_completed);
              const hasDone = dayItems.some(x => x.is_completed);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-11 flex flex-col items-center justify-center rounded-2xl transition-all active:scale-90 ${
                    isSelected
                      ? "bg-purple-400"
                      : isToday
                      ? "bg-purple-100"
                      : dayItems.length > 0
                      ? "hover:bg-purple-50 active:bg-purple-100"
                      : "active:bg-purple-50"
                  }`}
                >
                  <span className={`text-sm font-medium leading-none ${
                    isSelected ? "text-white" :
                    isToday ? "text-purple-700 font-bold" :
                    dayItems.length > 0 ? "text-purple-700" : "text-purple-300"
                  }`}>
                    {day}
                  </span>
                  {dayItems.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {hasPending && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-purple-400"}`} />}
                      {hasDone && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-purple-200" : "bg-purple-200"}`} />}
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
              Planned
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-200" />
              Done
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-5 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold" style={{ fontSize: 10 }}>n</span>
              </div>
              Today
            </div>
          </div>
        </div>

        {/* Upcoming list */}
        {upcoming.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider px-1">Upcoming Plans</p>
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden divide-y divide-purple-50">
              {upcoming.map(item => {
                const creator = users.find(u => u.id === item.created_by);
                const key = itemDateKey(item)!;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-4">
                    <button
                      onClick={() => onToggleItem(item)}
                      className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-purple-300 hover:border-purple-500 active:scale-90 transition-all flex items-center justify-center"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-purple-800 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
            <p className="text-purple-300 text-sm px-8">Go to Checklist, tap the 📅 icon on any item to pick a date</p>
          </div>
        )}
      </div>

      {/* Day sheet — rendered outside the scroll container so it's never clipped */}
      {selectedDate && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedDate(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-purple-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-purple-50">
              <div>
                <p className="font-semibold text-purple-800">{formatDisplay(selectedDate)}</p>
                {selectedItems.length > 0 ? (
                  <p className="text-xs text-purple-400 mt-0.5">
                    {selectedItems.filter(i => !i.is_completed).length} planned ·{" "}
                    {selectedItems.filter(i => i.is_completed).length} done
                  </p>
                ) : (
                  <p className="text-xs text-purple-300 mt-0.5">No activities planned</p>
                )}
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-9 h-9 rounded-2xl hover:bg-purple-50 flex items-center justify-center text-purple-400 active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
              {selectedItems.length === 0 ? (
                <div className="text-center py-10 text-purple-300 text-sm">
                  Nothing planned here yet
                </div>
              ) : (
                <div className="px-4 py-3 space-y-1">
                  {selectedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 rounded-2xl active:bg-purple-50 transition-colors"
                    >
                      <button
                        onClick={() => onToggleItem(item)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                          item.is_completed
                            ? "bg-purple-400 border-purple-400"
                            : "border-purple-300 hover:border-purple-500"
                        }`}
                      >
                        {item.is_completed && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${item.is_completed ? "line-through text-purple-300" : "text-purple-800"}`}>
                          {item.title}
                        </p>
                        {item.created_by_nickname && (
                          <p className="text-xs text-purple-400 mt-0.5">{item.created_by_nickname}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Safe area padding */}
              <div className="h-8" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
