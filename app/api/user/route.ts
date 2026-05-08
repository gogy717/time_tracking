import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const data: Record<string, unknown> = {};

  if (body.goalTargetDate !== undefined) {
    data.goalTargetDate = body.goalTargetDate ? new Date(body.goalTargetDate) : null;
  }

  if (typeof body.weeklyGoalHours === "number" && body.weeklyGoalHours > 0) {
    data.weeklyGoalHours = body.weeklyGoalHours;
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, weeklyGoalHours: true, goalTargetDate: true },
  });

  return NextResponse.json(user);
}
