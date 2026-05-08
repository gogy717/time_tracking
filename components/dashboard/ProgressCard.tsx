import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import DomainProgressBar from "./DomainProgressBar";

type Domain = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  totalMinutes: number;
  thisWeekMinutes: number;
  progressTo3000h: number;
  progressTo7000h: number;
};

export default function ProgressCard({ domain }: { domain: Domain }) {
  return (
    <Link href={`/domains/${domain.id}`} className="block bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: domain.color }} />
        <h3 className="font-semibold text-gray-900 truncate">{domain.name}</h3>
        {domain.icon && <span className="ml-auto">{domain.icon}</span>}
      </div>

      <p className="text-2xl font-bold text-gray-900 mb-4">{formatDuration(domain.totalMinutes)}</p>

      <div className="space-y-3">
        <DomainProgressBar
          label="入门 3000h"
          progress={domain.progressTo3000h}
          color={domain.color}
          current={domain.totalMinutes / 60}
          target={3000}
        />
        <DomainProgressBar
          label="准专家 7000h"
          progress={domain.progressTo7000h}
          color={domain.color}
          current={domain.totalMinutes / 60}
          target={7000}
        />
      </div>

      {domain.thisWeekMinutes > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          本周 +{formatDuration(domain.thisWeekMinutes)}
        </p>
      )}
    </Link>
  );
}
