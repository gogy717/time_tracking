import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { domainId } = await req.json();
  if (!domainId) return NextResponse.json({ error: "domainId is required" }, { status: 400 });

  const domain = await db.domain.findFirst({ where: { id: domainId, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const active = await db.timeSession.findFirst({
    where: { userId: session.user.id, endTime: null },
  });
  if (active) {
    return NextResponse.json({ error: "A timer is already running", sessionId: active.id }, { status: 409 });
  }

  const timeSession = await db.timeSession.create({
    data: {
      userId: session.user.id,
      domainId,
      startTime: new Date(),
    },
  });

  return NextResponse.json({ sessionId: timeSession.id, startTime: timeSession.startTime }, { status: 201 });
}
