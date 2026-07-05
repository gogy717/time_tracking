import { auth } from "@/lib/auth";
import { cleanPositiveNumber, parseOptionalDate, readJsonBody } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const data: Record<string, unknown> = {};

  if (body.goalTargetDate !== undefined) {
    const goalTargetDate = parseOptionalDate(body.goalTargetDate);
    if (goalTargetDate === undefined) {
      return NextResponse.json({ error: "Invalid goalTargetDate" }, { status: 400 });
    }
    data.goalTargetDate = goalTargetDate;
  }

  if (body.weeklyGoalHours !== undefined) {
    const weeklyGoalHours = cleanPositiveNumber(body.weeklyGoalHours, { max: 1000 });
    if (!weeklyGoalHours) {
      return NextResponse.json({ error: "weeklyGoalHours must be positive" }, { status: 400 });
    }
    data.weeklyGoalHours = weeklyGoalHours;
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, weeklyGoalHours: true, goalTargetDate: true },
  });

  return NextResponse.json(user);
}
