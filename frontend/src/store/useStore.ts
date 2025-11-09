import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Note {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DialogNote {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

interface StoreState {
  // Current selected category
  selectedCategoryId: string | null;
  setSelectedCategory: (categoryId: string | null) => void;

  // Notes
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // UI State
  isNoteDialogOpen: boolean;
  setNoteDialogOpen: (open: boolean) => void;
  draftNote: DialogNote | null;
  setDraftNote: (note: DialogNote | null) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Category state
      selectedCategoryId: null,
      setSelectedCategory: (categoryId) =>
        set({ selectedCategoryId: categoryId }),

      // Notes state
      notes: [],
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, updatedNote) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note,
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      // UI state
      isNoteDialogOpen: false,
      setNoteDialogOpen: (open) => set({ isNoteDialogOpen: open }),
      draftNote: null,
      setDraftNote: (note) => set({ draftNote: note }),
      editingNoteId: null,
      setEditingNoteId: (id) => set({ editingNoteId: id }),
    }),
    {
      name: "notes-storage",
      partialize: (state) => ({
        selectedCategoryId: state.selectedCategoryId,
        notes: state.notes,
      }),
    },
  ),
);
