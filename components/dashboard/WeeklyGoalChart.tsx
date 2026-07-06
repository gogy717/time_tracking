"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function WeeklyGoalChart({ progress }: { progress: number }) {
  const data = [{ value: Math.min(progress, 100), fill: "#548373" }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart innerRadius="60%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
        <RadialBar dataKey="value" background={{ fill: "rgba(110,92,70,0.10)" }} cornerRadius={8} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
