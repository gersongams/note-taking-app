"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { NoteDialog } from "@/components/NoteDialog";

type NoteModalProps = {
  note: {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    categorySlug: string;
    updatedAt: string;
  };
  categories: {
    id: string;
    name: string;
    color: string;
  }[];
};

export function NoteModal({ note, categories }: NoteModalProps) {
  const router = useRouter();
  const fallbackPath = `/${note.categorySlug}`;

  const closeModal = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackPath);
  }, [fallbackPath, router]);

  return (
    <NoteDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
      categories={categories}
      note={{
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.categoryId,
        updatedAt: note.updatedAt,
      }}
    />
  );
}
