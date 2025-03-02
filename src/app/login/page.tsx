"use client";

import { useState, useEffect } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        await account.get();
        router.push("/dashboard"); // Redirect if session exists
      } catch {
        console.log("No active session, proceed to login.");
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ Ensure no active session before logging in
      try {
        await account.get();
        throw new Error("You are already logged in.");
      } catch {
        // No session found, continue with login
      }

      // ✅ Corrected Appwrite session method
      await account.createEmailPasswordSession(email, password);

      // ✅ Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* ✅ Home Button */}
      <button
        onClick={() => router.push("/")}
        className="mt-4 bg-gray-500 px-4 py-2 rounded text-white hover:bg-gray-600 transition"
      >
        Home
      </button>
    </div>
  );
}
