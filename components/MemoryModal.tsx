"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface MemoryModalProps {
  itemTitle: string;
  itemEmoji: string;
  onSave: (imageUrl: string) => void;
  onSkip: () => void;
}

export default function MemoryModal({ itemTitle, itemEmoji, onSave, onSkip }: MemoryModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-3xl">{itemEmoji}</div>
          <h2 className="text-base font-semibold text-purple-800">Add a photo?</h2>
          <p className="text-sm text-purple-400">
            <span className="font-medium text-purple-600">"{itemTitle}"</span>
          </p>
        </div>

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-purple-100">
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-40 object-cover"
              />
              <button
                onClick={() => { setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-purple-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center gap-2 text-purple-300 hover:text-purple-500 hover:border-purple-300 transition-colors bg-purple-50/30"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Upload photo from device</span>
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-2xl border border-purple-200 text-purple-500 font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => onSave(imageUrl)}
            className="flex-1 py-2.5 rounded-2xl bg-purple-400 text-white font-semibold text-sm hover:bg-purple-500 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
