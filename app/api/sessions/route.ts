import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const domainId = searchParams.get("domainId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const [sessions, total] = await Promise.all([
    db.timeSession.findMany({
      where: {
        userId: session.user.id,
        endTime: { not: null },
        ...(domainId ? { domainId } : {}),
      },
      include: { domain: { select: { name: true, color: true } } },
      orderBy: { startTime: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.timeSession.count({
      where: {
        userId: session.user.id,
        endTime: { not: null },
        ...(domainId ? { domainId } : {}),
      },
    }),
  ]);

  return NextResponse.json({ sessions, total, page, totalPages: Math.ceil(total / limit) });
}
