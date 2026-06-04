"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Settings, ListChecks } from "lucide-react";
import { User, Category, ChecklistItem } from "@/lib/types";
import Avatar from "@/components/Avatar";
import CategoryCard from "@/components/CategoryCard";
import ProfileModal from "@/components/ProfileModal";
import MemoryModal from "@/components/MemoryModal";
import { useConfetti } from "@/components/ConfettiEffect";

const CATEGORY_EMOJIS = ["✨", "🍽️", "🚗", "🏠", "🎬", "🏖️", "🎡", "🌿", "🍦", "🎮", "📸", "🌅", "💃", "🎵", "🛍️", "🍕", "☕", "🎭", "🏔️", "✈️", "🎪", "🌸", "🎨", "🏋️", "🎯"];

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [activeUserId, setActiveUserId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [pendingToggleItem, setPendingToggleItem] = useState<ChecklistItem | null>(null);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("✨");
  const [addingCategory, setAddingCategory] = useState(false);

  const fireConfetti = useConfetti();

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];
  const mimiUser = users[0];
  const bedUser = users[1];

  // Initialize DB then load data
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/init", { method: "POST" });
        setDbReady(true);
      } catch {
        setDbReady(true);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, catsRes, itemsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/categories"),
        fetch("/api/items"),
      ]);
      const [usersData, catsData, itemsData] = await Promise.all([
        usersRes.json(),
        catsRes.json(),
        itemsRes.json(),
      ]);
      setUsers(usersData);
      setCategories(catsData);
      setItems(itemsData);
      if (usersData.length > 0) setActiveUserId(usersData[0].id);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dbReady) loadData();
  }, [dbReady, loadData]);

  const totalPlanned = items.filter((i) => !i.is_completed).length;
  const totalCompleted = items.filter((i) => i.is_completed).length;

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim(), emoji: newCategoryEmoji }),
    });
    const cat = await res.json();
    setCategories((prev) => [...prev, cat]);
    setNewCategoryName("");
    setNewCategoryEmoji("✨");
    setShowNewCategory(false);
    setAddingCategory(false);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category and all its activities?")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setItems((prev) => prev.filter((i) => i.category_id !== id));
  };

  const handleAddItem = async (categoryId: number, title: string, emoji: string) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: categoryId, title, emoji, created_by: activeUserId }),
    });
    const newItem = await res.json();
    newItem.created_by_nickname = activeUser?.nickname;
    newItem.created_by_avatar = activeUser?.avatar_url;
    setItems((prev) => [...prev, newItem]);
  };

  const handleToggleItem = (item: ChecklistItem) => {
    if (!item.is_completed) {
      setPendingToggleItem(item);
    } else {
      completeToggle(item, false, null);
    }
  };

  const completeToggle = async (item: ChecklistItem, completing: boolean, memoryUrl: string | null) => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_completed: completing,
        completed_by: completing ? activeUserId : null,
        memory_image_url: memoryUrl,
      }),
    });
    const updated = await res.json();
    updated.created_by_nickname = item.created_by_nickname;
    updated.created_by_avatar = item.created_by_avatar;
    if (completing) {
      updated.completed_by_nickname = activeUser?.nickname;
      updated.completed_by_avatar = activeUser?.avatar_url;
      fireConfetti();
    }
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setPendingToggleItem(null);
  };

  const handleDeleteItem = async (id: number) => {
    await fetch("/api/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveProfile = async (nickname: string, avatar_url: string, tagline?: string) => {
    if (!editingUser) return;
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingUser.id, nickname, avatar_url, tagline }),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-3xl animate-pulse">✨</div>
          <p className="text-purple-400 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-400 rounded-2xl flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-purple-800 text-base leading-none">Checklist</h1>
              <p className="text-xs text-purple-400 leading-none">shared checklist</p>
            </div>
          </div>

          {/* User switcher */}
          <div className="flex items-center gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setActiveUserId(user.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm font-medium ${
                  activeUserId === user.id
                    ? "bg-purple-400 text-white shadow-sm"
                    : "bg-purple-100 text-purple-500 hover:bg-purple-200"
                }`}
              >
                <Avatar url={user.avatar_url} nickname={user.nickname} size="sm" />
                <span className="hidden sm:inline">{user.nickname}</span>
              </button>
            ))}
            <button
              onClick={() => {
                const u = users.find((u) => u.id === activeUserId);
                if (u) { setEditingUser(u); setShowProfileModal(true); }
              }}
              className="p-2 rounded-full hover:bg-purple-50 text-purple-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-28 space-y-4 pt-4">
        {/* Status bubbles */}
        {(mimiUser?.tagline || bedUser?.tagline) && (
          <div className="space-y-2 pt-1">
            {mimiUser?.tagline && (
              <div className="flex items-end gap-2">
                <Avatar url={mimiUser.avatar_url} nickname={mimiUser.nickname} size="md" />
                <div className="relative">
                  <div className="absolute bottom-3 -left-1 w-2.5 h-2.5 bg-purple-100 rotate-45" />
                  <div className="relative bg-purple-100 rounded-2xl rounded-bl-none px-3.5 py-2 z-10 max-w-[260px]">
                    <p className="text-sm text-purple-700 leading-snug">{mimiUser.tagline}</p>
                  </div>
                </div>
              </div>
            )}
            {bedUser?.tagline && (
              <div className="flex items-end gap-2 justify-end">
                <div className="relative">
                  <div className="absolute bottom-3 -right-1 w-2.5 h-2.5 bg-purple-400 rotate-45" />
                  <div className="relative bg-purple-400 rounded-2xl rounded-br-none px-3.5 py-2 z-10 max-w-[260px]">
                    <p className="text-sm text-white leading-snug">{bedUser.tagline}</p>
                  </div>
                </div>
                <Avatar url={bedUser.avatar_url} nickname={bedUser.nickname} size="md" />
              </div>
            )}
          </div>
        )}

        {/* Stats Banner */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-purple-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-xl">📋</div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalPlanned}</p>
              <p className="text-xs text-purple-400 font-medium">Planned</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-purple-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-xl">✅</div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalCompleted}</p>
              <p className="text-xs text-purple-400 font-medium">Completed</p>
            </div>
          </div>
        </div>

        {/* Active user indicator */}
        {activeUser && (
          <div className="flex items-center gap-2 px-1">
            <Avatar url={activeUser.avatar_url} nickname={activeUser.nickname} size="sm" />
            <p className="text-xs text-purple-400">
              Adding as <span className="font-semibold text-purple-600">{activeUser.nickname}</span>
            </p>
          </div>
        )}

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <div className="text-4xl">✨</div>
            <p className="text-purple-500 font-medium text-sm">No categories yet</p>
            <p className="text-purple-300 text-xs">Tap the button below to get started</p>
          </div>
        )}

        {/* Category cards */}
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            items={items.filter((i) => i.category_id === category.id)}
            activeUser={activeUser}
            onAddItem={handleAddItem}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
            onDeleteCategory={handleDeleteCategory}
          />
        ))}

        {/* New category inline form */}
        {showNewCategory && (
          <div className="bg-white rounded-3xl border border-purple-200 p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-purple-900 text-sm">New Category</h3>
            <div className="flex gap-2">
              <select
                value={newCategoryEmoji}
                onChange={(e) => setNewCategoryEmoji(e.target.value)}
                className="px-2 py-2.5 rounded-2xl border border-purple-200 text-base bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {CATEGORY_EMOJIS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="e.g. Foodie Adventures"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-900"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewCategory(false)}
                className="flex-1 py-2.5 rounded-2xl border border-purple-200 text-purple-500 text-sm font-semibold hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={addingCategory || !newCategoryName.trim()}
                className="flex-1 py-2.5 rounded-2xl bg-purple-400 text-white text-sm font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50"
              >
                {addingCategory ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating action button */}
      {!showNewCategory && (
        <button
          onClick={() => setShowNewCategory(true)}
          className="fixed bottom-6 right-4 flex items-center gap-2 bg-purple-400 text-white px-5 py-3.5 rounded-full shadow-lg hover:bg-purple-500 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold text-sm">New Category</span>
        </button>
      )}

      {/* Profile modal */}
      {showProfileModal && editingUser && (
        <ProfileModal
          user={editingUser}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
          showTagline={true}
        />
      )}

      {/* Memory modal (shown when checking off an item) */}
      {pendingToggleItem && (
        <MemoryModal
          itemTitle={pendingToggleItem.title}
          itemEmoji={pendingToggleItem.emoji}
          onSave={(url) => completeToggle(pendingToggleItem, true, url || null)}
          onSkip={() => completeToggle(pendingToggleItem, true, null)}
        />
      )}
    </div>
  );
}
