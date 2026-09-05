import { api, extractErrorMessage } from "@/services/api";
import type { ApiEnvelope } from "@/services/api";
import type { ContactRef } from "@/types/lead-refs";

// GET /api/v1/contacts — open to all roles (see backend/src/routes/contacts.routes.js)
export async function fetchContacts(): Promise<ContactRef[]> {
  try {
    const { data } = await api.get<ApiEnvelope<ContactRef[]>>("/contacts");
    return data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to load contacts"));
  }
}