import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");

    const items = categoryId
      ? await sql`
          SELECT ci.*,
            uc.nickname as created_by_nickname, uc.avatar_url as created_by_avatar,
            ux.nickname as completed_by_nickname, ux.avatar_url as completed_by_avatar,
            COALESCE(array_agg(DISTINCT f.user_id) FILTER (WHERE f.user_id IS NOT NULL), ARRAY[]::integer[]) as favorited_by,
            COUNT(DISTINCT co.id)::integer as comment_count
          FROM checklist_items ci
          LEFT JOIN users uc ON ci.created_by = uc.id
          LEFT JOIN users ux ON ci.completed_by = ux.id
          LEFT JOIN item_favorites f ON ci.id = f.item_id
          LEFT JOIN item_comments co ON ci.id = co.item_id
          WHERE ci.category_id = ${categoryId}
          GROUP BY ci.id, uc.nickname, uc.avatar_url, ux.nickname, ux.avatar_url
          ORDER BY ci.created_at ASC
        `
      : await sql`
          SELECT ci.*,
            uc.nickname as created_by_nickname, uc.avatar_url as created_by_avatar,
            ux.nickname as completed_by_nickname, ux.avatar_url as completed_by_avatar,
            COALESCE(array_agg(DISTINCT f.user_id) FILTER (WHERE f.user_id IS NOT NULL), ARRAY[]::integer[]) as favorited_by,
            COUNT(DISTINCT co.id)::integer as comment_count
          FROM checklist_items ci
          LEFT JOIN users uc ON ci.created_by = uc.id
          LEFT JOIN users ux ON ci.completed_by = ux.id
          LEFT JOIN item_favorites f ON ci.id = f.item_id
          LEFT JOIN item_comments co ON ci.id = co.item_id
          GROUP BY ci.id, uc.nickname, uc.avatar_url, ux.nickname, ux.avatar_url
          ORDER BY ci.created_at ASC
        `;

    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category_id, title, emoji, created_by } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const [item] = await sql`
      INSERT INTO checklist_items (category_id, title, emoji, created_by)
      VALUES (${category_id}, ${title.trim()}, ${emoji || "💜"}, ${created_by})
      RETURNING *
    `;
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await sql`DELETE FROM checklist_items WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
