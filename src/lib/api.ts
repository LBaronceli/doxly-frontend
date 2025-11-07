// lib/api.ts
import {
  Customer,
  Attachment,
  Me,
  CustomerListResponse,
  AttachmentListResponse,
} from "./types";

// Backend service URLs - update these if your services run on different ports
const AUTH_BASE = "/api/auth";
const CUSTOMER_BASE = "/api/customer";
const ATTACH_BASE = "/api/attachments";

const tokenKey = "doxly_token";

export const getToken = () =>
  typeof window !== "undefined" ? sessionStorage.getItem(tokenKey) : null;
export const setToken = (t: string) => sessionStorage.setItem(tokenKey, t);
export const clearToken = () => sessionStorage.removeItem(tokenKey);

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json")
    ? ((await res.json()) as T)
    : (undefined as unknown as T);
}

// ---------- Auth ----------
export const authApi = {
  signup: (email: string, password: string, org_name: string) =>
    request<{ token: string }>(`${AUTH_BASE}/v1/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, org_name }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string }>(`${AUTH_BASE}/v1/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<Me>(`${AUTH_BASE}/v1/me`),
};

// ---------- Customers ----------
export const customersApi = {
  list: (limit = 20, cursor?: string) =>
    request<CustomerListResponse>(
      `${CUSTOMER_BASE}/v1/customers?limit=${limit}${
        cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
      }`
    ),

  get: (id: string) =>
    request<Customer>(
      `${CUSTOMER_BASE}/v1/customers/${encodeURIComponent(id)}`
    ),

  create: (payload: Partial<Customer>) =>
    request<Customer>(`${CUSTOMER_BASE}/v1/customers`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Customer>) =>
    request<Customer>(
      `${CUSTOMER_BASE}/v1/customers/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  remove: (id: string) =>
    request<void>(`${CUSTOMER_BASE}/v1/customers/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

// ---------- Attachments ----------
export const attachmentsApi = {
  presign: (
    customerId: string,
    filename: string,
    content_type: string,
    size?: number
  ) =>
    request<{ url: string; object_key: string }>(
      `${ATTACH_BASE}/v1/customers/${encodeURIComponent(
        customerId
      )}/attachments/presign`,
      {
        method: "POST",
        body: JSON.stringify({ filename, content_type, size }),
      }
    ),

  confirm: (
    customerId: string,
    body: {
      object_key: string;
      filename: string;
      content_type: string;
      size?: number; // client-side field; backend may expect size_bytes
    }
  ) =>
    request<Attachment>(
      `${ATTACH_BASE}/v1/customers/${encodeURIComponent(
        customerId
      )}/attachments/confirm`,
      {
        method: "POST",
        body: JSON.stringify({
          object_key: body.object_key,
          filename: body.filename,
          content_type: body.content_type,
          // Map to backend’s expected name if required:
          size_bytes: body.size,
        }),
      }
    ),

  list: (customerId: string, limit = 20) =>
    request<AttachmentListResponse>(
      `${ATTACH_BASE}/v1/customers/${encodeURIComponent(
        customerId
      )}/attachments?limit=${limit}`
    ),

  // short-lived presigned GET URL
  getDownloadUrl: (
    customerId: string,
    attachmentId: string,
    disposition: "attachment" | "inline" = "attachment"
  ) =>
    request<{ url: string }>(
      `${ATTACH_BASE}/v1/customers/${encodeURIComponent(
        customerId
      )}/attachments/${encodeURIComponent(
        attachmentId
      )}/download-url?disposition=${disposition}`
    ),
};

// ---------- Raw PUT to presigned URL ----------
export async function uploadToPresignedUrl(
  url: string,
  file: File | Blob,
  contentType: string
) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
  }
}
