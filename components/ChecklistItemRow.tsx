"use client";

import { useState } from "react";
import { Trash2, ImageIcon } from "lucide-react";
import { ChecklistItem } from "@/lib/types";
import Avatar from "./Avatar";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: (item: ChecklistItem) => void;
  onDelete: (id: number) => void;
}

export default function ChecklistItemRow({ item, onToggle, onDelete }: ChecklistItemRowProps) {
  const [showPhoto, setShowPhoto] = useState(false);

  const completedDate = item.completed_at
    ? new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-2xl transition-all ${
        item.is_completed ? "opacity-55 bg-purple-50/40" : "hover:bg-purple-50/40"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          item.is_completed
            ? "bg-purple-400 border-purple-400"
            : "border-purple-300 hover:border-purple-400"
        }`}
      >
        {item.is_completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm font-medium ${item.is_completed ? "line-through text-purple-300" : "text-purple-800"}`}>
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {item.created_by_nickname && (
            <div className="flex items-center gap-1 bg-purple-100 rounded-full px-2 py-0.5">
              <Avatar url={item.created_by_avatar} nickname={item.created_by_nickname} size="sm" />
              <span className="text-xs text-purple-500">{item.created_by_nickname}</span>
            </div>
          )}

          {item.is_completed && item.completed_by_nickname && (
            <div className="flex items-center gap-1 bg-purple-100 rounded-full px-2 py-0.5">
              <span className="text-xs text-purple-500">
                ✓ {item.completed_by_nickname} · {completedDate}
              </span>
            </div>
          )}
        </div>

        {item.is_completed && item.memory_image_url && (
          <div className="mt-1.5">
            <button
              onClick={() => setShowPhoto(!showPhoto)}
              className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-600 transition-colors"
            >
              <ImageIcon className="w-3 h-3" />
              {showPhoto ? "Hide photo" : "View photo"}
            </button>
            {showPhoto && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-purple-100">
                <img
                  src={item.memory_image_url}
                  alt="photo"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-300 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
