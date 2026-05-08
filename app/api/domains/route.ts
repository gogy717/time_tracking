import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const domains = await db.domain.findMany({
    where: { userId: session.user.id, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(domains);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color, icon, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const domain = await db.domain.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      color: color ?? "#6366f1",
      icon,
      description,
    },
  });

  return NextResponse.json(domain, { status: 201 });
}
