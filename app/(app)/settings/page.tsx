import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, image: true, weeklyGoalHours: true },
  });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">设置</h1>
      <SettingsClient user={user!} />
    </div>
  );
}
