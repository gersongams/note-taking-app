"use client";

import { Plus } from "lucide-react";
import { type DialogNote, useStore } from "@/store/useStore";
import { CategorySelect } from "./CategorySelect";
import { Button } from "./ui/button";

interface Category {
  id: string;
  name: string;
  color: string;
  slug: string;
  count?: number;
}

interface HeaderProps {
  onNewNote?: () => void;
  defaultCategory?: string;
  categories?: Category[];
  currentCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export const Header = ({
  onNewNote,
  defaultCategory,
  categories = [],
  currentCategoryId,
  onCategoryChange,
}: HeaderProps) => {
  const setNoteDialogOpen = useStore((state) => state.setNoteDialogOpen);
  const setDraftNote = useStore((state) => state.setDraftNote);

  const handleNewNote = () => {
    const emptyNote: DialogNote = {
      id: "",
      title: "",
      content: "",
      category: defaultCategory || "",
      updatedAt: new Date().toISOString(),
    };
    setDraftNote(emptyNote);
    setNoteDialogOpen(true);
    onNewNote?.();
  };

  return (
    <header className="bg-background sticky top-0 z-10 pt-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 px-4 md:px-8 pb-6">
        {/* Mobile Only: Category Select */}
        {categories.length > 0 && (
          <div className="block md:hidden w-full">
            <CategorySelect
              categories={categories}
              value={currentCategoryId}
              onValueChange={onCategoryChange}
              placeholder="All Categories"
            />
          </div>
        )}

        {/* New Note Button */}
        <Button
          onClick={handleNewNote}
          className="rounded-xl bg-transparent border border-[#D4C7B7] hover:bg-muted/30 cursor-pointer text-foreground w-full md:w-auto md:ml-auto"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
    </header>
  );
};
