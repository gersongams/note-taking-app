export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  notes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  preview: string;
  category_name: string;
  category_color: string;
  category_slug: string;
  created_at: string;
  updated_at: string;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  category_name: string;
  category_color: string;
  category_slug: string;
  created_at: string;
  updated_at: string;
}
