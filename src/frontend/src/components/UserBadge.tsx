import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserBadge({ user }: { user: string }) {
  const isChris = user === "Christopher";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-body",
        isChris ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700",
      )}
    >
      <User className="h-3 w-3" />
      {user}
    </span>
  );
}
