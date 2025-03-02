import { databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_APPOINTMENTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPOINTMENTS!;
const COLLECTION_PATIENTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PATIENTS!;
const COLLECTION_DOCTORS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DOCTORS!;

/**
 * Fetches all appointments for a specific doctor.
 */
export async function getAppointments(doctorId: string) {
  if (!doctorId) throw new Error("Doctor ID is required.");

  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_APPOINTMENTS, [
      Query.equal("doctor_id", doctorId),
      Query.orderDesc("date"),
    ]);

    // Fetch patient names
    const appointments = await Promise.all(
      response.documents.map(async (doc: any) => {
        try {
          const patient = await databases.getDocument(DATABASE_ID, COLLECTION_PATIENTS, doc.patient_id);
          return {
            $id: doc.$id,
            date: doc.date,
            status: doc.status,
            patient_name: patient.name, // ✅ Attach patient name
          };
        } catch {
          return { ...doc, patient_name: "Unknown Patient" };
        }
      })
    );

    return appointments;
  } catch (error: any) {
    console.error("Error fetching appointments:", error.message || error);
    throw new Error(error.message || "Failed to fetch appointments.");
  }
}

/**
 * Fetches pending appointments for a specific doctor.
 */
export async function getPendingAppointments(doctorId: string) {
  if (!doctorId) throw new Error("Doctor ID is required.");

  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_APPOINTMENTS, [
      Query.equal("doctor_id", doctorId),
      Query.equal("status", "pending"),
      Query.orderDesc("date"),
    ]);

    return response.documents;
  } catch (error: any) {
    console.error("Error fetching pending appointments:", error.message || error);
    throw new Error(error.message || "Failed to fetch pending appointments.");
  }
}

/**
 * Approves an appointment by updating its status.
 */
export async function approveAppointment(appointmentId: string) {
  if (!appointmentId) throw new Error("Appointment ID is required.");

  try {
    await databases.updateDocument(DATABASE_ID, COLLECTION_APPOINTMENTS, appointmentId, {
      status: "approved",
    });

    return { message: "Appointment approved successfully" };
  } catch (error: any) {
    console.error("Error approving appointment:", error.message || error);
    throw new Error(error.message || "Failed to approve appointment.");
  }
}

/**
 * Cancels an appointment.
 */
export async function cancelAppointment(appointmentId: string) {
  if (!appointmentId) throw new Error("Appointment ID is required.");

  try {
    await databases.updateDocument(DATABASE_ID, COLLECTION_APPOINTMENTS, appointmentId, {
      status: "cancelled",
    });

    return { message: "Appointment cancelled successfully" };
  } catch (error: any) {
    console.error("Error cancelling appointment:", error.message || error);
    throw new Error(error.message || "Failed to cancel appointment.");
  }
}

/**
 * Fetches all appointments for the admin dashboard.
 */
export async function getAllAppointments() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_APPOINTMENTS, [
      Query.orderDesc("date"),
    ]);

    const appointments = await Promise.all(
      response.documents.map(async (doc: any) => {
        try {
          const patient = await databases.getDocument(DATABASE_ID, COLLECTION_PATIENTS, doc.patient_id);
          const doctor = await databases.getDocument(DATABASE_ID, COLLECTION_DOCTORS, doc.doctor_id);

          return {
            $id: doc.$id,
            date: doc.date,
            status: doc.status,
            patient_name: patient.name || "Unknown Patient",
            doctor_name: doctor.name || "Unknown Doctor",
          };
        } catch {
          return { ...doc, patient_name: "Unknown", doctor_name: "Unknown" };
        }
      })
    );

    return appointments;
  } catch (error: any) {
    console.error("Error fetching all appointments:", error.message || error);
    throw new Error(error.message || "Failed to fetch all appointments.");
  }
}

/**
 * Books a new appointment for a patient with a doctor.
 */
export async function bookAppointment(patientId: string, doctorId: string, date: string) {
  if (!patientId || !doctorId || !date) {
    throw new Error("Invalid patient, doctor ID, or date");
  }

  try {
    return await databases.createDocument(DATABASE_ID, COLLECTION_APPOINTMENTS, ID.unique(), {
      patient_id: patientId,
      doctor_id: doctorId,
      date,
      status: "pending",
    });
  } catch (error: any) {
    console.error("Error booking appointment:", error.message || error);
    throw new Error(error.message || "Failed to book appointment.");
  }
}
