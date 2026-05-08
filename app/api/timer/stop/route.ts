import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const now = new Date();

  const active = await db.timeSession.findFirst({
    where: {
      userId: session.user.id,
      ...(body.sessionId ? { id: body.sessionId } : { endTime: null }),
    },
  });

  if (!active) return NextResponse.json({ error: "No active timer" }, { status: 404 });

  const durationMinutes = (now.getTime() - active.startTime.getTime()) / 60000;

  const updated = await db.timeSession.update({
    where: { id: active.id },
    data: {
      endTime: now,
      durationMinutes,
      note: body.note,
    },
  });

  return NextResponse.json(updated);
}
