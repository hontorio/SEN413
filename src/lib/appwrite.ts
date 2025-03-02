import { Client, Account, Databases, Storage, ID, Query, Models } from "appwrite";

// ✅ Load and validate environment variables
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const doctorsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DOCTORS || ""; // ✅ Corrected naming

if (!endpoint || !projectId || !databaseId || !doctorsCollectionId) {
  console.error("❌ Missing Appwrite configuration (endpoint, project ID, database ID, or doctors collection ID).");
  throw new Error("Appwrite configuration error: Missing required environment variables.");
}

// ✅ Initialize Appwrite Client
export const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

// ✅ Initialize Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, databaseId, doctorsCollectionId };

// ✅ Define return type for `getCurrentUser`
interface AuthenticatedUser {
  user: Models.User<Models.Preferences> | null;
  doctor: Models.Document | null;
}

/**
 * ✅ Fetch doctor profile using `doctor_id`.
 * @param doctorId - The Appwrite user ID of the doctor.
 * @returns The doctor profile or `null` if not found.
 */
export async function getDoctor(doctorId: string): Promise<Models.Document | null> {
  try {
    const response = await databases.listDocuments(databaseId, doctorsCollectionId, [
      Query.equal("doctor_id", doctorId),
    ]);

    if (response.documents.length === 0) {
      return null; // No doctor found
    }

    console.log("✅ Doctor Profile Found:", response.documents[0]);
    return response.documents[0]; // ✅ Return first matched doctor
  } catch (error: any) {
    console.error("⚠️ Error fetching doctor profile:", error.message || error);
    return null;
  }
}

/**
 * ✅ Fetch the current authenticated user.
 * - Returns `{ user, doctor }` if authenticated and a doctor.
 * - Returns `{ user, doctor: null }` if authenticated but not a doctor.
 * - Logs out user if session is invalid or expired.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const user = await account.get();
    console.log("✅ Authenticated User:", user);

    // ✅ Check if user is a doctor
    const doctor = await getDoctor(user.$id);

    return { user, doctor }; // ✅ Return both user and doctor profile
  } catch (error: any) {
    console.error("⚠️ Authentication error:", error.message || error);

    // 🚨 If the session is invalid, attempt to refresh it
    if (error.code === 401) {
      console.warn("🔄 Session expired. Trying to refresh...");

      try {
        await account.updateSession("current"); // ✅ Refresh the session
        const refreshedUser = await account.get();
        const doctor = await getDoctor(refreshedUser.$id);
        return { user: refreshedUser, doctor };
      } catch (refreshError) {
        console.warn("⚠️ Session refresh failed. Logging out...");
        await account.deleteSession("current");
        return null;
      }
    }

    return null;
  }
}
