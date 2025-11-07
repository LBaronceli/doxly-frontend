// lib/types.ts

export type Me = {
  user_id: string;
  org_id: string;
  email: string;
  role: "admin" | "member";
};

export interface Attachment {
  id: string;
  filename: string;
  object_key?: string;
  content_type?: string | null;
  size_bytes: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at?: string;
}

// List response shapes (some endpoints may return either an array or a paged object)
export type CustomerListResponse =
  | { items?: Customer[]; cursor?: string }
  | Customer[];

export type AttachmentListResponse =
  | { items?: Attachment[]; cursor?: string }
  | Attachment[];

export interface LoginForm {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
}
