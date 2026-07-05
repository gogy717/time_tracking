import { auth } from "@/lib/auth";
import { cleanOptionalString, cleanPositiveNumber, parseOptionalDate, readJsonBody } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const domainId = typeof body.domainId === "string" ? body.domainId : "";
  const hours = cleanPositiveNumber(body.hours, { max: 10000 });
  if (!domainId || !hours) {
    return NextResponse.json({ error: "domainId and hours are required" }, { status: 400 });
  }

  const domain = await db.domain.findFirst({ where: { id: domainId, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const durationMinutes = hours * 60;
  const parsedDate = parseOptionalDate(body.date);
  if (parsedDate === undefined) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const endTime = parsedDate ?? new Date();
  if (endTime.getTime() > Date.now() + 60_000) {
    return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
  }
  const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000);
  const note = cleanOptionalString(body.note, 500);

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
