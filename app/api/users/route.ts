import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const users = await sql`SELECT * FROM users ORDER BY id ASC`;
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nickname, avatar_url, tagline } = await req.json();
    const [user] = await sql`
      UPDATE users SET nickname = ${nickname}, avatar_url = ${avatar_url}, tagline = ${tagline ?? null}
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
