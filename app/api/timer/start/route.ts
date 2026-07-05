import { auth } from "@/lib/auth";
import { readJsonBody } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const domainId = typeof body.domainId === "string" ? body.domainId : "";
  if (!domainId) return NextResponse.json({ error: "domainId is required" }, { status: 400 });

  const domain = await db.domain.findFirst({ where: { id: domainId, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const active = await db.timeSession.findFirst({
    where: { userId: session.user.id, endTime: null },
  });
  if (active) {
    return NextResponse.json({ error: "A timer is already running", sessionId: active.id }, { status: 409 });
  }

  try {
    const timeSession = await db.timeSession.create({
      data: {
        userId: session.user.id,
        domainId,
        startTime: new Date(),
      },
    });

    return NextResponse.json({ sessionId: timeSession.id, startTime: timeSession.startTime }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const activeSession = await db.timeSession.findFirst({
        where: { userId: session.user.id, endTime: null },
      });
      return NextResponse.json(
        { error: "A timer is already running", sessionId: activeSession?.id },
        { status: 409 }
      );
    }
    throw error;
  }
}
