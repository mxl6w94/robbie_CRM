import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-600",
  estimate: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  invoiced: "bg-purple-100 text-purple-800",
  unpaid: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: string | null }) {
  const key = status ?? "unknown";
  const label = key.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colorMap[key] ?? "bg-gray-100 text-gray-600"
      )}
    >
      {label}
    </span>
  );
}
