import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const item_id = searchParams.get("item_id");
    if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });
    const comments = await sql`
      SELECT ic.*, u.nickname as user_nickname, u.avatar_url as user_avatar
      FROM item_comments ic
      LEFT JOIN users u ON ic.user_id = u.id
      WHERE ic.item_id = ${item_id}
      ORDER BY ic.created_at ASC
    `;
    return NextResponse.json(comments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { item_id, user_id, content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
    const [comment] = await sql`
      INSERT INTO item_comments (item_id, user_id, content)
      VALUES (${item_id}, ${user_id}, ${content.trim()})
      RETURNING *
    `;
    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await sql`DELETE FROM item_comments WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
