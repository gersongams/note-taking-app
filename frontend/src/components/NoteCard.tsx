import { format, isToday, isYesterday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
  onClick?: () => void;
}

export function NoteCard({
  title,
  content,
  category,
  updatedAt,
  onClick,
}: NoteCardProps) {
  const date = new Date(updatedAt);
  let formattedDate: string;

  if (isToday(date)) {
    formattedDate = "today";
  } else if (isYesterday(date)) {
    formattedDate = "yesterday";
  } else {
    formattedDate = format(date, "MMMM d");
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow rounded-2xl overflow-hidden border-[3px]"
      style={{
        backgroundColor: `${category.color}80`,
        borderColor: category.color,
      }}
      onClick={onClick}
    >
      <CardHeader className="space-y-3 pb-1">
        <div className="text-sm text-black">
          <span className="font-semibold mr-2">{formattedDate}</span>
          <span>{category.name}</span>
        </div>
        <CardTitle className="text-2xl font-serif font-bold text-black leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-black text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
