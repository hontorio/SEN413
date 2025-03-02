"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookAppointment } from "@/app/api/appointments";
import { useAuth } from "@/lib/auth";
import { getDoctors } from "@/app/api/doctors"; // ✅ Fetch doctors from API

export default function BookAppointment() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      const doctorList = await getDoctors();
      setDoctors(doctorList);
    }
    fetchDoctors();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <div className="text-center text-red-500 mt-10">Please log in.</div>;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date) {
      setError("Please select a doctor and date.");
      return;
    }

    try {
      await bookAppointment(user.$id, doctorId, date);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to book appointment.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded-lg shadow-lg" onSubmit={handleBooking}>
        <h2 className="text-2xl font-semibold">Book an Appointment</h2>

        {error && <p className="text-red-500">{error}</p>}

        {/* Select Doctor Dropdown */}
        <label className="block mt-4">
          <span className="text-gray-700">Select Doctor:</span>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select a Doctor --</option>
            {doctors.map((doctor) => (
              <option key={doctor.$id} value={doctor.$id}>
                {doctor.name} (Specialty: {doctor.specialty})
              </option>
            ))}
          </select>
        </label>

        {/* Select Date */}
        <label className="block mt-4">
          <span className="text-gray-700">Select Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-600"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
