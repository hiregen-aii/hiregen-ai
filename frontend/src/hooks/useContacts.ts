import { useQuery } from "@tanstack/react-query";
import { fetchContacts } from "@/services/contacts.service";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
    staleTime: 60_000,
  });
}