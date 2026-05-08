import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { domainId, hours, date, note } = await req.json();

  if (!domainId || typeof hours !== "number" || hours <= 0) {
    return NextResponse.json({ error: "domainId and hours are required" }, { status: 400 });
  }

  const domain = await db.domain.findFirst({ where: { id: domainId, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const durationMinutes = hours * 60;
  const endTime = date ? new Date(date) : new Date();
  const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000);

  const timeSession = await db.timeSession.create({
    data: {
      userId: session.user.id,
      domainId,
      startTime,
      endTime,
      durationMinutes,
      note: note || "手动添加",
    },
  });

  return NextResponse.json(timeSession, { status: 201 });
}
