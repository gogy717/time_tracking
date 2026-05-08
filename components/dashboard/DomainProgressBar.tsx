export default function DomainProgressBar({
  label,
  progress,
  color,
  current,
  target,
}: {
  label: string;
  progress: number;
  color: string;
  current: number;
  target: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {current.toFixed(1)}h / {target}h
      </p>
    </div>
  );
}
