import { databases, account, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_DOCTORS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DOCTORS!;

/**
 * Registers a new doctor.
 */
export async function registerDoctor(
  name: string,
  specialization: string,
  email: string,
  password: string
) {
  if (!name || !specialization || !email || !password) {
    throw new Error("All fields (name, specialization, email, password) are required.");
  }

  try {
    // ✅ Check if email is already used
    const existingDoctor = await databases.listDocuments(DATABASE_ID, COLLECTION_DOCTORS, [
      Query.equal("email", email),
    ]);

    if (existingDoctor.documents.length > 0) {
      throw new Error("A doctor with this email already exists.");
    }

    // ✅ Step 1: Create a user account for the doctor
    const user = await account.create(ID.unique(), email, password, name);

    // ✅ Step 2: Store doctor details in the database
    const doctorProfile = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_DOCTORS,
      ID.unique(),
      {
        name,
        specialization,
        doctor_id: user.$id, // ✅ Ensure doctor is linked correctly
        email,
        available: true, // ✅ Include availability status
      }
    );

    return { message: "Doctor registered successfully", user, doctorProfile };
  } catch (error: any) {
    console.error("❌ Error registering doctor:", error.message || error);
    throw new Error(error.message || "Failed to register doctor.");
  }
}

/**
 * Fetches a doctor's profile using their user ID.
 */
export async function getDoctor(doctorId: string) {
  if (!doctorId) {
    throw new Error("Doctor ID is required.");
  }

  try {
    // ✅ Fetch doctor using `doctor_id` field (not document ID)
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_DOCTORS, [
      Query.equal("doctor_id", doctorId),
    ]);

    if (response.documents.length === 0) {
      throw new Error("Doctor not found.");
    }

    return response.documents[0]; // ✅ Return the first matching doctor
  } catch (error: any) {
    console.error("❌ Error fetching doctor:", error.message || error);
    throw new Error(error.message || "Failed to fetch doctor details.");
  }
}

/**
 * Fetches a list of all doctors.
 */
export async function getDoctors() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_DOCTORS, [
      Query.limit(100),
    ]);

    return response.documents.map((doc: any) => ({
      $id: doc.$id,
      name: doc.name,
      specialization: doc.specialization,
      email: doc.email, // ✅ Ensure email is included
      available: doc.available, // ✅ Ensure "available" is included
    }));
  } catch (error: any) {
    console.error("❌ Error fetching doctors:", error.message || error);
    throw new Error(error.message || "Failed to fetch doctors.");
  }
}
