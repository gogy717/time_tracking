export interface Milestone {
  hours: number;
  label: string;
  desc: string;
}

export const LADDER: Milestone[] = [
  { hours: 100,   label: "略知一二", desc: "能聊这个话题" },
  { hours: 500,   label: "入门",     desc: "掌握基本功" },
  { hours: 1000,  label: "熟练",     desc: "扎实的基础" },
  { hours: 2000,  label: "中级",     desc: "驾轻就熟" },
  { hours: 3000,  label: "进阶",     desc: "超越大多数学习者" },
  { hours: 5000,  label: "专业",     desc: "职业水准" },
  { hours: 7000,  label: "准专家",   desc: "同行认可" },
  { hours: 10000, label: "专家",     desc: "顶尖水准" },
];

export interface MilestoneResult {
  completed: Milestone[];
  key: Milestone[];  // 3 most important upcoming ones
}

export function pick3Milestones(currentHours: number, targetHours: number): MilestoneResult {
  const safeTarget = (typeof targetHours === "number" && targetHours > 0) ? targetHours : 10000;
  // Get all milestones up to targetHours
  let relevant = LADDER.filter(m => m.hours <= safeTarget);
  targetHours = safeTarget;
  // If targetHours isn't in the standard ladder, add it
  if (!relevant.find(m => m.hours === targetHours)) {
    // Find nearest label
    const nearest = [...LADDER].reverse().find(m => m.hours <= targetHours);
    relevant.push({ hours: targetHours, label: nearest?.label ?? "目标", desc: "你设定的目标" });
  }
  // Sort by hours
  relevant.sort((a, b) => a.hours - b.hours);

  const completed = relevant.filter(m => m.hours <= currentHours);
  const upcoming = relevant.filter(m => m.hours > currentHours);

  if (upcoming.length === 0) return { completed, key: [] };
  if (upcoming.length <= 3) return { completed, key: upcoming };

  // Always include: next, a mid, and the target
  const next = upcoming[0];
  const target = upcoming[upcoming.length - 1];
  const midIdx = Math.ceil(upcoming.length / 2);
  const mid = upcoming[midIdx];

  const key: Milestone[] = [next];
  if (mid.hours !== next.hours && mid.hours !== target.hours) key.push(mid);
  if (target.hours !== next.hours) key.push(target);

  return { completed, key };
}
