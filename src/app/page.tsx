"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome to Clinic Plus</h1>
      <div className="mt-4 flex gap-4">
        <Link href="/signup">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
        </Link>
        <Link href="/login">
          <button className="bg-green-500 text-white px-4 py-2 rounded">Log In</button>
        </Link>
      </div>

      {/* ✅ Added Admin Signup Link */}
      <p className="mt-6 text-center">
        Admin?{" "}
        <Link href="/admin/signup" className="text-blue-600 font-semibold hover:underline">
          Register a Doctor
        </Link>
      </p>
    </div>
  );
}
