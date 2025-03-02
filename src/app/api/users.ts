import { databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
const COLLECTION_USERS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS as string;

// ✅ Ensure environment variables are set at runtime
if (!DATABASE_ID || !COLLECTION_USERS) {
  throw new Error("Missing required environment variables: DATABASE_ID or COLLECTION_USERS.");
}

export async function getUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const user = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, userId);

    return {
      id: user.$id,
      name: user.name,
      email: user.email,
      doctor_id: user.doctor_id ?? null, // Ensure `doctor_id` is always present
    };
  } catch (error: any) {
    if (error?.response?.code === 404) {
      console.error(`User not found: ${userId}`);
      return null; // Return `null` instead of throwing to handle missing users gracefully
    }
    console.error("Error fetching user:", error.message || error);
    throw new Error("Failed to fetch user.");
  }
}

export async function createUser(userData: { name: string; email: string; doctor_id?: string }) {
  try {
    return await databases.createDocument(DATABASE_ID, COLLECTION_USERS, ID.unique(), {
      name: userData.name,
      email: userData.email,
      doctor_id: userData.doctor_id ?? null, // Ensure `doctor_id` is optional
    });
  } catch (error: any) {
    console.error("Error creating user:", error.message || error);
    throw new Error("Failed to create user.");
  }
}
