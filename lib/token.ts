import { auth } from "@/lib/firebase";

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 