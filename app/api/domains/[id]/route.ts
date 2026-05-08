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
      name: body.name?.trim(),
      color: body.color,
      icon: body.icon,
      description: body.description,
      isArchived: body.isArchived,
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
