"use client";

import { useState } from "react";
import { Plus, Trash2, Shuffle, ChevronDown, ChevronUp, X } from "lucide-react";
import { Category, ChecklistItem, User } from "@/lib/types";
import ChecklistItemRow from "./ChecklistItemRow";

interface CategoryCardProps {
  category: Category;
  items: ChecklistItem[];
  activeUser: User;
  onAddItem: (categoryId: number, title: string, emoji: string) => Promise<void>;
  onToggleItem: (item: ChecklistItem) => void;
  onDeleteItem: (id: number) => void;
  onDeleteCategory: (id: number) => void;
  onEditItem: (id: number, title: string) => Promise<void>;
  onFavoriteItem: (itemId: number) => Promise<void>;
}

export default function CategoryCard({
  category,
  items,
  activeUser,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onDeleteCategory,
  onEditItem,
  onFavoriteItem,
}: CategoryCardProps) {
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [spinResult, setSpinResult] = useState<ChecklistItem | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const pending = items.filter((i) => !i.is_completed);
  const completed = items.filter((i) => i.is_completed);

  const handleAddItem = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    await onAddItem(category.id, newTitle, category.emoji);
    setNewTitle("");
    setAdding(false);
    setShowAdd(false);
  };

  const spinRandom = () => {
    if (pending.length === 0) return;
    setSpinResult(pending[Math.floor(Math.random() * pending.length)]);
  };

  return (
    <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-purple-50/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2.5 flex-1 text-left min-w-0"
        >
          <span className="text-xl flex-shrink-0">{category.emoji}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-purple-800 text-sm truncate">{category.name}</h3>
            <p className="text-xs text-purple-400">
              {pending.length} pending · {completed.length} done
            </p>
          </div>
          <span className="ml-auto mr-2 flex-shrink-0 text-purple-300">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </span>
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {pending.length > 0 && (
            <button
              onClick={spinRandom}
              title="Pick random"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-100 text-purple-500 hover:bg-purple-200 active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Random</span>
            </button>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-400 text-white hover:bg-purple-500 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">Add</span>
          </button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-2.5 rounded-xl hover:bg-red-50 text-red-200 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Random pick result */}
      {spinResult && (
        <div className="mx-4 mt-3 p-3 bg-purple-400 rounded-2xl text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🎲</span>
            <span className="font-medium text-sm">{spinResult.emoji} {spinResult.title}</span>
          </div>
          <button onClick={() => setSpinResult(null)} className="text-purple-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add item form */}
      {showAdd && (
        <div className="mx-4 mt-3 p-3 bg-purple-50 rounded-2xl space-y-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            placeholder="Activity name..."
            className="w-full px-3 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-purple-800 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAdd(false); setNewTitle(""); }}
              className="flex-1 py-2.5 rounded-xl border border-purple-200 text-purple-500 font-semibold hover:bg-purple-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              disabled={adding || !newTitle.trim()}
              className="flex-1 py-2.5 rounded-xl bg-purple-400 text-white font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Items */}
      {!collapsed && (
        <div className="px-3 pb-3 mt-2 space-y-0.5">
          {pending.length === 0 && completed.length === 0 && (
            <p className="text-center text-purple-300 py-4">No items yet</p>
          )}

          {pending.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              activeUser={activeUser}
              onToggle={onToggleItem}
              onDelete={onDeleteItem}
              onEdit={onEditItem}
              onFavorite={onFavoriteItem}
            />
          ))}

          {completed.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-2 px-1">
                <div className="flex-1 h-px bg-purple-100" />
                <span className="text-xs text-purple-300 font-medium">Completed</span>
                <div className="flex-1 h-px bg-purple-100" />
              </div>
              {completed.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  activeUser={activeUser}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                  onEdit={onEditItem}
                  onFavorite={onFavoriteItem}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
