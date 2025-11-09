import { apiGet } from "@/lib/api-fetch";
import { isNetworkError } from "@/lib/network-error";
import type { Category, Note, NoteDetail } from "@/types/notes";

// Re-export types for backwards compatibility
export type { Category, Note, NoteDetail };

export async function fetchNotesByCategory(
  categorySlug: string,
): Promise<Note[]> {
  try {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.slug === categorySlug);

    if (!category) {
      return [];
    }

    const data = await apiGet<{ results?: Note[] } | Note[]>(
      `/api/notes/notes/?category=${category.id}`,
      { cache: "no-store" },
    );

    if (
      data &&
      typeof data === "object" &&
      "results" in data &&
      Array.isArray(data.results)
    ) {
      return data.results;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    if (isNetworkError(error)) {
      throw error;
    }
    return [];
  }
}

export async function fetchNotes(): Promise<Note[]> {
  try {
    const data = await apiGet<{ results?: Note[] } | Note[]>(
      "/api/notes/notes/",
      { cache: "no-store" },
    );

    if (
      data &&
      typeof data === "object" &&
      "results" in data &&
      Array.isArray(data.results)
    ) {
      return data.results;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    if (isNetworkError(error)) {
      throw error;
    }
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const data = await apiGet<{ results?: Category[] } | Category[]>(
      "/api/notes/categories/",
      { cache: "no-store" },
    );

    if (
      data &&
      typeof data === "object" &&
      "results" in data &&
      Array.isArray(data.results)
    ) {
      return data.results;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    if (isNetworkError(error)) {
      throw error;
    }
    return [];
  }
}

export async function fetchNoteById(
  noteId: string,
): Promise<NoteDetail | null> {
  try {
    const data = await apiGet<NoteDetail>(`/api/notes/notes/${noteId}/`, {
      cache: "no-store",
    });

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      throw error;
    }
    return null;
  }
}
