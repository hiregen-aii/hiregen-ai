import { api, extractErrorMessage } from "./api";

export interface ScheduleMeetingInput {
  leadId: string;
  date: string;
  time: string;
  link?: string;
  notes?: string;
}

export async function scheduleMeeting(input: ScheduleMeetingInput) {
  try {
    const { data } = await api.post("/meetings", input);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to schedule meeting"));
  }
}

export async function fetchMeetings() {
  try {
    const { data } = await api.get("/meetings");
    return data.data ?? [];
  } catch (err) {
    throw new Error(extractErrorMessage(err, "Failed to fetch meetings"));
  }
}
