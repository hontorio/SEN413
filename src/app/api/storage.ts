import { client } from "@/lib/appwrite";
import { Storage, ID } from "appwrite";

const storage = new Storage(client);
const BUCKET_ID = "your_bucket_id"; // Replace with actual bucket ID

export async function uploadFile(file: File) {
  try {
    return await storage.createFile(BUCKET_ID, ID.unique(), file);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function getFilePreview(fileId: string) {
  try {
    return storage.getFilePreview(BUCKET_ID, fileId);
  } catch (error) {
    console.error("Error getting file preview:", error);
    throw error;
  }
}
