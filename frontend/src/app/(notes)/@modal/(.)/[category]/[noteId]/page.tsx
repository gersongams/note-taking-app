import { notFound } from "next/navigation";
import { NoteModal } from "@/components/NoteModal";
import { fetchCategories, fetchNoteById } from "@/lib/api/notes";

type PageProps = {
  params: Promise<{
    category: string;
    noteId: string;
  }>;
};

export default async function NoteModalParallelRoute({ params }: PageProps) {
  const { noteId } = await params;

  // Fetch note and categories from backend
  const [note, categories] = await Promise.all([
    fetchNoteById(noteId),
    fetchCategories(),
  ]);

  if (!note) {
    notFound();
  }

  return (
    <NoteModal
      categories={categories}
      note={{
        id: note.id,
        title: note.title,
        content: note.content,
        categoryId: note.category,
        categorySlug: note.category_slug,
        updatedAt: note.updated_at,
      }}
    />
  );
}
