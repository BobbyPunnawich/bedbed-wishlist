"use client";

interface AvatarProps {
  url?: string | null;
  nickname: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-12 h-12 text-base",
};

export default function Avatar({ url, nickname, size = "sm" }: AvatarProps) {
  const initials = nickname.slice(0, 2).toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={nickname}
        className={`${sizes[size]} rounded-full object-cover border-2 border-purple-200 bg-purple-50`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-purple-200 flex items-center justify-center font-semibold text-purple-700 border-2 border-purple-300`}
    >
      {initials}
    </div>
  );
}
