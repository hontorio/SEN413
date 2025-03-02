"use client";

import { useState } from "react";
import { bookAppointment } from "@/app/api/appointments";

const AppointmentForm = ({ patientId }: { patientId: string }) => {
  const [date, setDate] = useState("");

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctorId = "doctor-123"; // Replace with actual doctor selection
    await bookAppointment(patientId, doctorId, date);
    alert("Appointment booked!");
  };

  return (
    <form onSubmit={handleBooking}>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit">Book Appointment</button>
    </form>
  );
};

export default AppointmentForm;
