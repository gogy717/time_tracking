import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const domain = await db.domain.findFirst({ where: { id, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.domain.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
      ...(body.targetHours !== undefined && { targetHours: body.targetHours }),
      ...(body.targetDate !== undefined && { targetDate: body.targetDate ? new Date(body.targetDate) : null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const domain = await db.domain.findFirst({ where: { id, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.domain.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
