import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weeklyGoalHours } = await req.json();

  if (typeof weeklyGoalHours !== "number" || weeklyGoalHours < 0) {
    return NextResponse.json({ error: "Invalid weeklyGoalHours" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { weeklyGoalHours },
    select: { id: true, weeklyGoalHours: true },
  });

  return NextResponse.json(user);
}
