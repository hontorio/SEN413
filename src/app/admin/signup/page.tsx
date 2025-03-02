"use client";

import { useState } from "react";
import { registerDoctor } from "@/app/api/doctors";
import { useRouter } from "next/navigation";

export default function AdminSignup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState(""); // ✅ Fixed field name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await registerDoctor(name, specialization, email, password); // ✅ Fixed function call
      setSuccess("Doctor registered successfully! Redirecting...");

      // Clear fields
      setName("");
      setSpecialization("");
      setEmail("");
      setPassword("");

      // Redirect to Admin Dashboard after 2 seconds
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register doctor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Register a Doctor</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Doctor's Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Specialization" // ✅ Updated placeholder
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className={`w-full py-2 rounded ${
              loading ? "bg-gray-400" : "bg-blue-500"
            } text-white`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Doctor"}
          </button>
        </form>
        
        <button
          onClick={() => router.push("/admin")}
          className="mt-4 w-full text-blue-500 hover:underline"
        >
          Back to Admin Dashboard
        </button>
      </div>
    </div>
  );
}
