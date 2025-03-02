"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, getCurrentUser, getDoctor } from "@/lib/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Check if already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const doctorProfile = await getDoctor(user.$id);
          if (doctorProfile) {
            router.push("/admin"); // Redirect to dashboard
          }
        }
      } catch (err) {
        console.log("No active session");
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ Authenticate Doctor
      const session = await account.createEmailPasswordSession(email, password);
      const userId = session?.userId || session?.$id; // Ensure correct ID retrieval

      // ✅ Verify if user is a doctor
      const doctorProfile = await getDoctor(userId);
      if (!doctorProfile) {
        setError("❌ Access denied: You are not registered as a doctor.");
        await account.deleteSession("current"); // Logout invalid doctor
        return;
      }

      // ✅ Redirect to Admin Dashboard
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "❌ Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center">Admin Login</h2>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleLogin} className="mt-4">
          <div className="mb-3">
            <label className="block font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? "🔄 Logging in..." : "🔑 Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="text-blue-500 hover:underline">← Back to Home</a>
          <br />
          <a href="/admin" className="text-blue-500 hover:underline">🏥 Go to Admin Dashboard</a>
        </div>
      </div>
    </div>
  );
}
