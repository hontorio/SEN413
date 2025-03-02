import { account, databases } from "./appwrite"; 
import { useState, useEffect } from "react";

// Constants for Database & Collection IDs (Replace with actual values)
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || "clinic_db"; 
const DOCTORS_COLLECTION_ID = process.env.NEXT_PUBLIC_DOCTORS_COLLECTION_ID || "doctors"; 

/**
 * Fetch the currently authenticated user.
 */
export async function getCurrentUser(): Promise<any | null> {
  try {
    return await account.get();
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return null;
  }
}

/**
 * Fetch a doctor profile from the database.
 * @param doctorId - ID of the doctor
 */
export async function getDoctor(doctorId: string): Promise<any | null> {
  if (!doctorId) {
    console.error("❌ Error: Doctor ID is required");
    return null;
  }

  try {
    return await databases.getDocument(DATABASE_ID, DOCTORS_COLLECTION_ID, doctorId);
  } catch (error) {
    console.error(`❌ Error fetching doctor profile (ID: ${doctorId}):`, error);
    return null;
  }
}

/**
 * Hook to get the authenticated user in client components.
 */
export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    }
    fetchUser();
  }, []);

  return { user, loading };
}

// ✅ Final export statement
export { account};
