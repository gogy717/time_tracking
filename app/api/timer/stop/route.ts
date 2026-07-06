import { auth } from "@/lib/auth";
import { cleanOptionalString, readJsonBody } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await readJsonBody(req)) ?? {};
  const requestedEndTime = parseClientDate(body.endTime);
  if (body.endTime !== undefined && !requestedEndTime) {
    return NextResponse.json({ error: "Invalid endTime" }, { status: 400 });
  }

  const now = requestedEndTime ?? new Date();
  if (now.getTime() > Date.now() + 60_000) {
    return NextResponse.json({ error: "endTime cannot be in the future" }, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" && body.sessionId ? body.sessionId : undefined;

  const active = await db.timeSession.findFirst({
    where: {
      userId: session.user.id,
      endTime: null,
      ...(sessionId ? { id: sessionId } : {}),
    },
  });

  if (!active) {
    const startTime = parseClientDate(body.startTime);
    const domainId = typeof body.domainId === "string" ? body.domainId : "";
    if (!startTime || !domainId) return NextResponse.json({ ok: true, stopped: false });

    const domain = await db.domain.findFirst({ where: { id: domainId, userId: session.user.id } });
    if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

    const durationMinutes = Math.max(0, (now.getTime() - startTime.getTime()) / 60000);
    const note = cleanOptionalString(body.note, 500);
    const created = await db.timeSession.create({
      data: {
        userId: session.user.id,
        domainId,
        startTime,
        endTime: now,
        durationMinutes,
        ...(note !== undefined && { note }),
      },
    });

    return NextResponse.json({ ok: true, stopped: true, session: created });
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

function parseClientDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
