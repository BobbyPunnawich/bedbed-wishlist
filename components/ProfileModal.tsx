"use client";

import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { User } from "@/lib/types";
import Avatar from "./Avatar";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=alpha&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=beta&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=star&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=moon&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=nova&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=flux&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=echo&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=sage&backgroundColor=d1d4f9",
];

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (nickname: string, avatar_url: string, tagline?: string) => Promise<void>;
  showTagline?: boolean;
}

export default function ProfileModal({ user, onClose, onSave, showTagline }: ProfileModalProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [tagline, setTagline] = useState(user.tagline || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setSaving(true);
    await onSave(nickname.trim(), avatarUrl, showTagline ? tagline : undefined);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-purple-800">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-purple-50 transition-colors">
            <X className="w-4 h-4 text-purple-400" />
          </button>
        </div>

        <div className="flex justify-center">
          <Avatar url={avatarUrl || null} nickname={nickname || "?"} size="lg" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Nickname</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname..."
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-purple-800 bg-purple-50/50"
          />
        </div>

        {showTagline && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Message</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="เดี๋ยวสอบเสร็จเราก็ได้ไปเที่ยวกันละนะเบ้ด"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-purple-800 bg-purple-50/50"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Avatar</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((url, i) => (
              <button
                key={i}
                onClick={() => setAvatarUrl(url)}
                className={`rounded-2xl overflow-hidden border-2 transition-all aspect-square ${
                  avatarUrl === url ? "border-purple-400 scale-105" : "border-transparent hover:border-purple-200"
                }`}
              >
                <img src={url} alt={`avatar ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload your photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-purple-200 flex items-center justify-center gap-2 text-purple-400 hover:text-purple-600 hover:border-purple-300 transition-colors bg-purple-50/30 text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Choose from device
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !nickname.trim()}
          className="w-full py-3 rounded-2xl bg-purple-400 text-white font-semibold text-sm hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
