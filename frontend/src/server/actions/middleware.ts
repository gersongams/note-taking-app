import type { NoteDetail } from "@/types/notes";

export type ActionState = {
  error?: string | Record<string, string[]>;
  success?: string;
  note?: NoteDetail;
} & Record<string, unknown>;
