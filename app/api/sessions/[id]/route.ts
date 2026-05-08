import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const timeSession = await db.timeSession.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!timeSession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.timeSession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
