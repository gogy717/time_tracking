"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { formatDuration } from "@/lib/utils";

export default function WeeklyGoalCard({
  thisWeekMinutes,
  goalHours,
  progress,
}: {
  thisWeekMinutes: number;
  goalHours: number;
  progress: number;
}) {
  const data = [{ value: Math.min(progress, 100), fill: "#6366f1" }];

  return (
    <div className="bg-white rounded-xl border p-6 flex items-center gap-8">
      <div className="w-32 h-32 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="90%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" background={{ fill: "#f3f4f6" }} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-sm text-gray-500">本周目标</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{progress.toFixed(0)}%</p>
        <p className="text-sm text-gray-500 mt-1">
          {formatDuration(thisWeekMinutes)} / {goalHours}h
        </p>
      </div>
    </div>
  );
}
