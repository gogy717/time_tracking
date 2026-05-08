import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

  const { name, color, icon, description, targetHours } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const domain = await db.domain.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      color: color ?? "#6366f1",
      icon,
      description,
      targetHours: typeof targetHours === "number" && targetHours > 0 ? targetHours : 10000,
    },
  });

  return NextResponse.json(domain, { status: 201 });
}
