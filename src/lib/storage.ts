import { client } from "@/lib/appwrite";
import { Storage, ID } from "appwrite";

const storage = new Storage(client);

export async function uploadFile(file: File) {
  try {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

    if (!bucketId) {
      throw new Error("Missing Appwrite bucket ID");
    }

    return await storage.createFile(bucketId, ID.unique(), file);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
