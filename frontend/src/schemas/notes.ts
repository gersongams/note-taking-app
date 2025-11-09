import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
});

export type NoteInput = z.infer<typeof noteSchema>;
