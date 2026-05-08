import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ session: null });

  const active = await db.timeSession.findFirst({
    where: { userId: session.user.id, endTime: null },
    include: { domain: { select: { id: true, name: true, color: true } } },
  });

  return NextResponse.json({ session: active });
}
