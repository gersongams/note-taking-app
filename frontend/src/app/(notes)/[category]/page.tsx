import { notFound } from "next/navigation";
import { NotesClient } from "@/components/NotesClient";
import { fetchCategories, fetchNotesByCategory } from "@/lib/api/notes";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  const [categories, notes] = await Promise.all([
    fetchCategories(),
    fetchNotesByCategory(categorySlug),
  ]);

  const category = categories.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <NotesClient notes={notes} categories={categories} category={category} />
  );
}
