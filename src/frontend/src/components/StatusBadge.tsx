import { cn } from "@/lib/utils";

type Status = "green" | "yellow" | "red";

interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-display",
        status === "green" && "status-green",
        status === "yellow" && "status-yellow",
        status === "red" && "status-red",
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "green" && "bg-success",
          status === "yellow" && "bg-warning",
          status === "red" && "bg-danger",
        )}
      />
      {children}
    </span>
  );
}
