import { auth } from "@/lib/auth";
import {
  cleanHexColor,
  cleanOptionalString,
  cleanPositiveNumber,
  cleanString,
  parseOptionalDate,
  readJsonBody,
} from "@/lib/api-validation";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const domain = await db.domain.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      targetHours: true,
      targetDate: true,
    },
  });
  if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const [total, recent, sessions] = await Promise.all([
    db.timeSession.aggregate({
      where: { domainId: id, userId: session.user.id, endTime: { not: null } },
      _sum: { durationMinutes: true },
    }),
    db.timeSession.aggregate({
      where: {
        domainId: id,
        userId: session.user.id,
        endTime: { not: null },
        startTime: { gte: fourWeeksAgo },
      },
      _sum: { durationMinutes: true },
    }),
    db.timeSession.findMany({
      where: { domainId: id, userId: session.user.id, endTime: { not: null } },
      orderBy: { startTime: "desc" },
      take: 50,
      select: {
        id: true,
        startTime: true,
        durationMinutes: true,
        note: true,
      },
    }),
  ]);

  const recentMinutes = recent._sum.durationMinutes ?? 0;

  return NextResponse.json({
    domain: {
      ...domain,
      targetDate: domain.targetDate?.toISOString() ?? null,
    },
    initialTotalMinutes: total._sum.durationMinutes ?? 0,
    weeklyAvgMinutes: recentMinutes / 4,
    initialSessions: sessions.map((item) => ({
      ...item,
      startTime: item.startTime.toISOString(),
    })),
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const domain = await db.domain.findFirst({ where: { id, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Prisma.DomainUpdateInput = {};

  if (body.name !== undefined) {
    const name = cleanString(body.name, 80);
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    data.name = name;
  }
  if (body.color !== undefined) data.color = cleanHexColor(body.color, domain.color);
  if (body.icon !== undefined) data.icon = cleanOptionalString(body.icon, 16);
  if (body.description !== undefined) data.description = cleanOptionalString(body.description, 500);
  if (body.isArchived !== undefined) {
    if (typeof body.isArchived !== "boolean") {
      return NextResponse.json({ error: "isArchived must be a boolean" }, { status: 400 });
    }
    data.isArchived = body.isArchived;
  }
  if (body.targetHours !== undefined) {
    const targetHours = cleanPositiveNumber(body.targetHours, { max: 100000 });
    if (!targetHours) return NextResponse.json({ error: "targetHours must be positive" }, { status: 400 });
    data.targetHours = targetHours;
  }
  if (body.targetDate !== undefined) {
    const targetDate = parseOptionalDate(body.targetDate);
    if (targetDate === undefined) return NextResponse.json({ error: "Invalid targetDate" }, { status: 400 });
    data.targetDate = targetDate;
  }

  try {
    const updated = await db.domain.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Domain name already exists" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const domain = await db.domain.findFirst({ where: { id, userId: session.user.id } });
  if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.domain.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
