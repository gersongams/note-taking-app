import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <Badge
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 font-normal",
        "hover:opacity-80 transition-opacity",
        className,
      )}
      style={{ backgroundColor: `${color}20`, color: "#3d3d3d" }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </Badge>
  );
}
