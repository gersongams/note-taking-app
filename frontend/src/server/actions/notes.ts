"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { apiDelete, apiPost, apiPut } from "@/lib/api-fetch";
import { formatZodErrors } from "@/lib/utils/format-zod-errors";
import { noteSchema } from "@/schemas/notes";
import type { NoteDetail } from "@/types/notes";
import type { ActionState } from "./middleware";

export async function saveNoteAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawData = {
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
    };

    const validatedData = noteSchema.parse(rawData);

    const isUpdate = validatedData.id && validatedData.id !== "";
    const endpoint = isUpdate
      ? `/api/notes/notes/${validatedData.id}/`
      : `/api/notes/notes/`;

    const payload = {
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
    };

    const data = isUpdate
      ? await apiPut<NoteDetail>(endpoint, payload)
      : await apiPost<NoteDetail>(endpoint, payload);

    revalidatePath("/");
    revalidatePath("/[category]", "page");

    return {
      success: isUpdate
        ? "Note updated successfully!"
        : "Note created successfully!",
      note: data,
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { error: formatZodErrors(error) };
    }

    console.error(`Error: on saveNoteAction ${error}`);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteNoteAction(noteId: string): Promise<ActionState> {
  try {
    await apiDelete(`/api/notes/notes/${noteId}/`);

    revalidatePath("/");
    revalidatePath("/[category]", "page");

    return {
      success: "Note deleted successfully!",
    };
  } catch (error) {
    console.error(`Error: on deleteNoteAction ${error}`);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
