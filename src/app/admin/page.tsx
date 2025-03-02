"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllAppointments, approveAppointment, cancelAppointment } from "@/app/api/appointments";
import { getCurrentUser, getDoctor, account } from "@/lib/auth"; // ✅ Fixed import

interface Appointment {
  $id: string;
  date: string;
  status: string;
  patient_name: string;
  doctor_name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);

  // Total count states
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [canceledCount, setCanceledCount] = useState<number>(0);

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        // ✅ Authenticate User
        const user = await getCurrentUser();
        if (!user) {
          router.push("/admin/login");
          return;
        }

        // ✅ Verify Doctor Role
        const doctorProfile = await getDoctor(user.$id);
        if (!doctorProfile) {
          await account.deleteSession("current"); // Logout unauthorized user
          router.push("/admin/login");
          return;
        }

        setDoctor(doctorProfile); // ✅ Store doctor info

        // ✅ Fetch Appointments
        const data = await getAllAppointments();
        setAppointments(data);

        // ✅ Update Counts
        setPendingCount(data.filter((apt) => apt.status === "pending").length);
        setScheduledCount(data.filter((apt) => apt.status === "approved").length);
        setCanceledCount(data.filter((apt) => apt.status === "canceled").length);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("❌ Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [router]); // ✅ Added `router` dependency

  const handleApprove = async (id: string) => {
    try {
      await approveAppointment(id);
      alert("✅ Appointment Approved");

      // ✅ Update UI without refetching
      setAppointments((prev) =>
        prev.map((apt) => (apt.$id === id ? { ...apt, status: "approved" } : apt))
      );
      setPendingCount((prev) => prev - 1);
      setScheduledCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error approving appointment:", error);
      alert("❌ Failed to approve appointment.");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id);
      alert("❌ Appointment Canceled");

      // ✅ Update UI without refetching
      setAppointments((prev) =>
        prev.map((apt) => (apt.$id === id ? { ...apt, status: "canceled" } : apt))
      );
      setPendingCount((prev) => prev - 1);
      setCanceledCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert("❌ Failed to cancel appointment.");
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("❌ Logout failed. Please try again.");
    }
  };

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>
        <p className="text-gray-600">Welcome, Dr. {doctor?.name || "Unknown"}</p>

        {/* ✅ Total Counts Section */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-yellow-200 p-4 rounded text-center">
            <h2 className="text-xl font-bold">{pendingCount}</h2>
            <p>Pending</p>
          </div>
          <div className="bg-green-200 p-4 rounded text-center">
            <h2 className="text-xl font-bold">{scheduledCount}</h2>
            <p>Scheduled</p>
          </div>
          <div className="bg-red-200 p-4 rounded text-center">
            <h2 className="text-xl font-bold">{canceledCount}</h2>
            <p>Canceled</p>
          </div>
        </div>

        {/* ✅ Appointments List */}
        <h2 className="mt-6 text-xl font-semibold">All Appointments</h2>
        {appointments.length > 0 ? (
          <ul className="mt-2 space-y-3">
            {appointments.map((appointment) => (
              <li
                key={appointment.$id}
                className="border p-3 rounded-md shadow-sm bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Patient:</strong> {appointment.patient_name} <br />
                    <strong>Doctor:</strong> {appointment.doctor_name} <br />
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
                  </p>
                </div>
                <div className="flex gap-2">
                  {appointment.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment.$id)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.$id)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No appointments found.</p>
        )}
      </div>
    </div>
  );
}
