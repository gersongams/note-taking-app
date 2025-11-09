"use client";

import { usePathname, useRouter } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { NoteCard } from "@/components/NoteCard";
import { NoteDialog } from "@/components/NoteDialog";
import { useStore } from "@/store/useStore";
import type { Category, Note } from "@/types/notes";

interface NotesClientProps {
  notes: Note[];
  categories: Category[];
  category?: Category;
}

export function NotesClient({ notes, categories, category }: NotesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const noteDialogOpen = useStore((state) => state.isNoteDialogOpen);
  const setNoteDialogOpen = useStore((state) => state.setNoteDialogOpen);
  const draftNote = useStore((state) => state.draftNote);

  // Check if we're on a note route (e.g., /category/noteId)
  // If so, the parallel route modal is handling the dialog
  const isOnNoteRoute = /^\/[a-z-]+\/[a-f0-9-]+$/.test(pathname);

  const defaultCategory = category?.id ?? categories[0]?.id ?? "";

  const emptyMessage = category
    ? `No notes in ${category.name} yet. Start writing!`
    : undefined;

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (selectedCategory) {
      router.push(`/${selectedCategory.slug}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        defaultCategory={defaultCategory}
        categories={categories}
        currentCategoryId={category?.id}
        onCategoryChange={handleCategoryChange}
      />

      <div className="flex-1 overflow-auto">
        {notes.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  content={note.preview}
                  category={{
                    id: category?.id ?? "",
                    name: note.category_name,
                    color: note.category_color,
                  }}
                  createdAt={note.created_at}
                  updatedAt={note.updated_at}
                  onClick={() => {
                    router.push(`/${note.category_slug}/${note.id}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {draftNote && !isOnNoteRoute && (
        <NoteDialog
          key={draftNote.id || "new-note"}
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          categories={categories}
          note={draftNote}
        />
      )}
    </div>
  );
}
