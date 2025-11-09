import { NotesClient } from "@/components/NotesClient";
import { fetchCategories, fetchNotes } from "@/lib/api/notes";

export default async function HomePage() {
  const [notes, categories] = await Promise.all([
    fetchNotes(),
    fetchCategories(),
  ]);

  return <NotesClient notes={notes} categories={categories} />;
}
