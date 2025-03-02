import { approveAppointment } from "@/app/api/appointments";

interface Params {
  id: string;
}

export default async function ApproveAppointment({ params }: { params: Params }) {
  const appointmentId = params.id;

  if (!appointmentId) {
    return <p>Error: Appointment ID is missing.</p>;
  }

  try {
    await approveAppointment(appointmentId);
    return <p>Appointment Approved</p>;
  } catch (error: any) {
    return <p>Error approving appointment: {error.message}</p>;
  }
}
