import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { item_id, user_id } = await req.json();
    const existing = await sql`
      SELECT 1 FROM item_favorites WHERE item_id = ${item_id} AND user_id = ${user_id}
    `;
    if (existing.length > 0) {
      await sql`DELETE FROM item_favorites WHERE item_id = ${item_id} AND user_id = ${user_id}`;
      return NextResponse.json({ favorited: false });
    }
    await sql`INSERT INTO item_favorites (item_id, user_id) VALUES (${item_id}, ${user_id})`;
    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
