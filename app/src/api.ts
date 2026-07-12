import { invoke } from "@tauri-apps/api/core";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  preview: string;
}

export const api = {
  createNote: (title?: string) => 
    invoke<Note>("create_note", { title }),
  
  saveNote: (id: string, title: string, content: string, createdAt: string) =>
    invoke<Note>("save_note", { id, title, content, createdAt }),
  
  listNotes: () =>
    invoke<NoteSummary[]>("list_notes"),
  
  readNote: (id: string) =>
    invoke<Note>("read_note", { id }),
  
  deleteNote: (id: string) =>
    invoke<void>("delete_note", { id }),
  
  searchNotes: (query: string) =>
    invoke<NoteSummary[]>("search_notes", { query }),
  
  getAllTitles: () =>
    invoke<[string, string][]>("get_all_titles"),
};
