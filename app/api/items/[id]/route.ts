import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if ("title" in body) {
      const [item] = await sql`
        UPDATE checklist_items SET title = ${body.title} WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json(item);
    }

    if ("planned_date" in body) {
      const [item] = await sql`
        UPDATE checklist_items SET planned_date = ${body.planned_date ?? null} WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json(item);
    }

    if ("completed_at" in body) {
      const [item] = await sql`
        UPDATE checklist_items SET completed_at = ${body.completed_at} WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json(item);
    }

    const { is_completed, completed_by, memory_image_url } = body;
    const [item] = await sql`
      UPDATE checklist_items
      SET
        is_completed = ${is_completed},
        completed_by = ${is_completed ? completed_by : null},
        completed_at = ${is_completed ? new Date().toISOString() : null},
        memory_image_url = ${memory_image_url ?? null}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
