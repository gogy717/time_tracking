import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const [domains, activeSession] = await Promise.all([
    db.domain.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, color: true },
    }),
    db.timeSession.findFirst({
      where: { userId, endTime: null },
      select: {
        id: true,
        startTime: true,
        domain: { select: { id: true, name: true, color: true } },
      },
    }),
  ]);

  return NextResponse.json({
    domains,
    activeSession: activeSession
      ? {
          id: activeSession.id,
          startTime: activeSession.startTime.toISOString(),
          domain: activeSession.domain,
        }
      : null,
  });
}
