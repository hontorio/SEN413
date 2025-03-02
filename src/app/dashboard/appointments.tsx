"use client";
import { useState } from "react";
import { bookAppointment } from "@/app/api/appointments";

export default function BookAppointment() {
  const [date, setDate] = useState("");
  
  // Ensure patientId and doctorId are properly handled
  const patientId = localStorage.getItem("patient_id") ?? "";
  const doctorId = localStorage.getItem("doctor_id") ?? ""; // Fetch doctorId dynamically if needed

  const handleBooking = async () => {
    if (!patientId) {
      alert("Error: Patient ID is missing. Please log in again.");
      return;
    }

    if (!doctorId) {
      alert("Error: No doctor selected. Please choose a doctor.");
      return;
    }

    if (!date) {
      alert("Please select a date for the appointment.");
      return;
    }

    try {
      await bookAppointment(patientId, doctorId, date);
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Book an Appointment</h2>
      <input 
        type="datetime-local" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
        className="border p-2 rounded w-full mb-2"
      />
      <button 
        onClick={handleBooking} 
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Book
      </button>
    </div>
  );
}
