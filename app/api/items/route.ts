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
            ux.nickname as completed_by_nickname, ux.avatar_url as completed_by_avatar
          FROM checklist_items ci
          LEFT JOIN users uc ON ci.created_by = uc.id
          LEFT JOIN users ux ON ci.completed_by = ux.id
          WHERE ci.category_id = ${categoryId}
          ORDER BY ci.created_at ASC
        `
      : await sql`
          SELECT ci.*,
            uc.nickname as created_by_nickname, uc.avatar_url as created_by_avatar,
            ux.nickname as completed_by_nickname, ux.avatar_url as completed_by_avatar
          FROM checklist_items ci
          LEFT JOIN users uc ON ci.created_by = uc.id
          LEFT JOIN users ux ON ci.completed_by = ux.id
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
