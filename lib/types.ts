export interface User {
  id: number;
  nickname: string;
  avatar_url: string;
  tagline?: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  category_id: number;
  title: string;
  emoji: string;
  is_completed: boolean;
  created_by: number;
  completed_by: number | null;
  completed_at: string | null;
  memory_image_url: string | null;
  created_at: string;
  created_by_nickname?: string;
  created_by_avatar?: string;
  completed_by_nickname?: string;
  completed_by_avatar?: string;
}
