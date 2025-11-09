import { ServerError } from "@/components/ServerError";
import { Sidebar } from "@/components/Sidebar";
import { fetchCategories } from "@/lib/api/notes";
import { isNetworkError } from "@/lib/network-error";
import type { Category } from "@/types/notes";

export default async function NotesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  let categories: Category[] = [];
  let hasNetworkError = false;
  let errorMessage = "";

  try {
    categories = await fetchCategories();
  } catch (error) {
    if (isNetworkError(error)) {
      hasNetworkError = true;
      errorMessage = error.message;
    }
  }

  if (hasNetworkError) {
    return (
      <div className="flex min-h-screen bg-background">
        <ServerError message={errorMessage} showRetry={true} />
      </div>
    );
  }

  const sidebarCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    color: cat.color,
    count: cat.notes_count || 0,
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar categories={sidebarCategories} />
      <main className="flex-1 relative">{children}</main>
      {modal}
    </div>
  );
}
