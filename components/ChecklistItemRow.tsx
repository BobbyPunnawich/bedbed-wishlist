"use client";

import { useState } from "react";
import { Trash2, ImageIcon, Heart, MessageCircle, Pencil, Check, X } from "lucide-react";
import { ChecklistItem, ItemComment, User } from "@/lib/types";
import Avatar from "./Avatar";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  activeUser: User;
  onToggle: (item: ChecklistItem) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => Promise<void>;
  onFavorite: (itemId: number) => Promise<void>;
}

export default function ChecklistItemRow({
  item,
  activeUser,
  onToggle,
  onDelete,
  onEdit,
  onFavorite,
}: ChecklistItemRowProps) {
  const [showPhoto, setShowPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [saving, setSaving] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ItemComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(item.comment_count ?? 0);

  const isFavoritedByMe = item.favorited_by?.includes(activeUser.id) ?? false;
  const favoriteCount = item.favorited_by?.length ?? 0;

  const completedDate = item.completed_at
    ? new Date(item.completed_at).toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const handleEditSave = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    setSaving(true);
    if (trimmed !== item.title) await onEdit(item.id, trimmed);
    setSaving(false);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditTitle(item.title);
    setIsEditing(false);
  };

  const loadComments = async () => {
    if (commentsLoaded) return;
    const res = await fetch(`/api/comments?item_id=${item.id}`);
    const data = await res.json();
    setComments(data);
    setCommentsLoaded(true);
  };

  const handleToggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    setAddingComment(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id, user_id: activeUser.id, content: trimmed }),
    });
    const comment = await res.json();
    comment.user_nickname = activeUser.nickname;
    comment.user_avatar = activeUser.avatar_url;
    setComments((prev) => [...prev, comment]);
    setLocalCommentCount((n) => n + 1);
    setNewComment("");
    setAddingComment(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentId }),
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setLocalCommentCount((n) => n - 1);
  };

  return (
    <div
      className={`p-3 rounded-2xl transition-all ${
        item.is_completed ? "opacity-60 bg-purple-50/40" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(item)}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            item.is_completed
              ? "bg-purple-400 border-purple-400"
              : "border-purple-300 hover:border-purple-400 active:scale-90"
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
          {/* Title row */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave();
                  if (e.key === "Escape") handleEditCancel();
                }}
                className="flex-1 text-purple-800 border border-purple-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                autoFocus
              />
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 active:scale-90 transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleEditCancel}
                className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-50 active:scale-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className={`font-medium leading-snug ${item.is_completed ? "line-through text-purple-300" : "text-purple-800"}`}>
              {item.title}
            </p>
          )}

          {/* Meta badges */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

          {/* Memory photo */}
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
                    alt="memory"
                    className="w-full max-h-48 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action row — always visible */}
          <div className="flex items-center gap-1 mt-2.5">
            {/* Favorite */}
            <button
              onClick={() => onFavorite(item.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all active:scale-90 ${
                isFavoritedByMe
                  ? "text-pink-500 bg-pink-50"
                  : "text-purple-300 hover:text-pink-400 hover:bg-pink-50"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavoritedByMe ? "fill-current" : ""}`} />
              {favoriteCount > 0 && <span className="text-xs font-medium">{favoriteCount}</span>}
            </button>

            {/* Comment */}
            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all active:scale-90 ${
                showComments
                  ? "text-purple-600 bg-purple-100"
                  : "text-purple-300 hover:text-purple-500 hover:bg-purple-50"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {localCommentCount > 0 && <span className="text-xs font-medium">{localCommentCount}</span>}
            </button>

            {/* Edit — only for incomplete items */}
            {!item.is_completed && !isEditing && (
              <button
                onClick={() => { setEditTitle(item.title); setIsEditing(true); }}
                className="flex items-center px-2 py-1 rounded-full text-purple-300 hover:text-purple-500 hover:bg-purple-50 transition-all active:scale-90"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(item.id)}
              className="flex items-center px-2 py-1 rounded-full text-red-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 border-t border-purple-100 pt-3 space-y-2.5">
              {comments.length === 0 && !addingComment && (
                <p className="text-xs text-purple-300 text-center py-1">No comments yet — be the first!</p>
              )}

              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 group/comment">
                  <Avatar url={comment.user_avatar ?? null} nickname={comment.user_nickname || "?"} size="sm" />
                  <div className="flex-1 bg-purple-50 rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-purple-600">{comment.user_nickname}</span>
                      {comment.user_id === activeUser.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-200 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* Add comment input */}
              <div className="flex items-center gap-2 pt-1">
                <Avatar url={activeUser.avatar_url} nickname={activeUser.nickname} size="sm" />
                <div className="flex-1 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 rounded-full border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-purple-800 text-xs"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={addingComment || !newComment.trim()}
                    className="w-8 h-8 rounded-full bg-purple-400 text-white flex items-center justify-center hover:bg-purple-500 transition-colors disabled:opacity-40 flex-shrink-0 active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
