"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategorySelectProps {
  categories: Category[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export function CategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = "Select category",
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full rounded-md border border-[#957139] bg-transparent px-4 py-1.5 shadow-none h-auto">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-md !bg-background border border-[#957139] shadow-lg backdrop-blur-none">
        {categories.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id}
            className="rounded-sm !bg-transparent hover:!bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
