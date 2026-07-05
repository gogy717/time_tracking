import { auth } from "@/lib/auth";
import { cleanOptionalString, readJsonBody } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await readJsonBody(req)) ?? {};
  const now = new Date();
  const sessionId = typeof body.sessionId === "string" && body.sessionId ? body.sessionId : undefined;

  const active = await db.timeSession.findFirst({
    where: {
      userId: session.user.id,
      endTime: null,
      ...(sessionId ? { id: sessionId } : {}),
    },
  });

  if (!active) {
    return NextResponse.json({ ok: true, stopped: false });
  }

  const durationMinutes = Math.max(0, (now.getTime() - active.startTime.getTime()) / 60000);
  const note = cleanOptionalString(body.note, 500);

  const updated = await db.timeSession.update({
    where: { id: active.id },
    data: {
      endTime: now,
      durationMinutes,
      ...(note !== undefined && { note }),
    },
  });

  return NextResponse.json({ ok: true, stopped: true, session: updated });
}
