import { auth } from "@/lib/auth";
import {
  cleanHexColor,
  cleanOptionalString,
  cleanPositiveNumber,
  cleanString,
  readJsonBody,
} from "@/lib/api-validation";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const domains = await db.domain.findMany({
    where: { userId: session.user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { timeSessions: { where: { endTime: { not: null } } } } } },
  });

  return NextResponse.json(domains);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const name = cleanString(body.name, 80);
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const icon = cleanOptionalString(body.icon, 16);
  const description = cleanOptionalString(body.description, 500);
  const targetHours = cleanPositiveNumber(body.targetHours, { max: 100000 }) ?? 10000;

  try {
    const domain = await db.domain.create({
      data: {
        userId: session.user.id,
        name,
        color: cleanHexColor(body.color),
        icon,
        description,
        targetHours,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Domain name already exists" }, { status: 409 });
    }
    throw error;
  }
}
