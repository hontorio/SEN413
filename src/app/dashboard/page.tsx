"use client";

import { useState, useEffect } from "react";
import { account, databases } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_APPOINTMENTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPOINTMENTS!;
const COLLECTION_DOCTORS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DOCTORS!;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);

  useEffect(() => {
    let isMounted = true; // ✅ Prevents state updates on unmounted components

    async function fetchData() {
      try {
        // ✅ Step 1: Get logged-in user
        const userData = await account.get();
        if (!isMounted) return;
        setUser(userData);

        // ✅ Step 2: Check if the user is a doctor
        const doctorResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_DOCTORS, [
          Query.equal("doctor_id", userData.$id),
        ]);

        if (doctorResponse.documents.length > 0) {
          setIsDoctor(true);

          // ✅ If doctor, fetch assigned appointments
          const response = await databases.listDocuments(DATABASE_ID, COLLECTION_APPOINTMENTS, [
            Query.equal("doctor_id", userData.$id),
          ]);
          if (!isMounted) return;
          setAppointments(response.documents);
        } else {
          // ✅ If patient, fetch their own appointments
          const response = await databases.listDocuments(DATABASE_ID, COLLECTION_APPOINTMENTS, [
            Query.equal("patient_id", userData.$id),
          ]);
          if (!isMounted) return;
          setAppointments(response.documents);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        if (!isMounted) return;
        setError(err.message || "Failed to load dashboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false; // ✅ Cleanup function to prevent memory leaks
    };
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold">
          {isDoctor ? `Welcome, Dr. ${user?.name}` : `Welcome, ${user?.name}`}
        </h1>
        <p className="text-gray-600">Email: {user?.email}</p>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          {!isDoctor && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => router.push("/book-appointment")}
            >
              📅 Book Appointment
            </button>
          )}
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            onClick={handleLogout}
          >
            🔒 Logout
          </button>
        </div>

        {/* Appointments List */}
        <h2 className="mt-6 text-xl font-semibold">
          {isDoctor ? "Appointments Assigned to You" : "Your Appointments"}
        </h2>
        {appointments.length > 0 ? (
          <ul className="mt-2">
            {appointments.map((appointment) => (
              <li
                key={appointment.$id}
                className="border p-3 rounded-md shadow-sm mt-2 bg-gray-50"
              >
                {isDoctor ? (
                  <>
                    <strong>Patient:</strong> {appointment.patient_name} <br />
                  </>
                ) : (
                  <>
                    <strong>Doctor:</strong> {appointment.doctor_name} <br />
                  </>
                )}
                <strong>Date:</strong> {appointment.date} <br />
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    appointment.status === "approved"
                      ? "bg-green-300"
                      : appointment.status === "pending"
                      ? "bg-yellow-300"
                      : "bg-red-300"
                  }`}
                >
                  {appointment.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No appointments yet.</p>
        )}
      </div>
    </div>
  );
}
