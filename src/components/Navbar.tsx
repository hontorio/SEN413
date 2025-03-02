"use client"; // Ensure it's a Client Component

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, getCurrentUser } from "@/lib/appwrite";
import { Models } from "appwrite"; // ✅ Import Appwrite models for type safety

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData.user);
          setIsAdmin(!!userData.doctor); // ✅ Check if user is a doctor (admin)
        }
      } catch (error) {
        console.error("⚠️ Error fetching user:", error);
        setUser(null);
        setIsAdmin(false);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await account.deleteSession("current");
    setUser(null);
    setIsAdmin(false);
    router.push("/"); // ✅ Redirect to homepage after logout
  };

  const handleAdminButtonClick = () => {
    router.push(isAdmin ? "/admin" : "/admin/login"); // ✅ Redirect based on admin status
  };

  return (
    <nav className="p-4 bg-blue-600 text-white flex justify-between items-center">
      <h1 className="text-lg font-bold cursor-pointer" onClick={() => router.push("/")}>
        Clinic Plus
      </h1>

      <div className="flex gap-4">
        {/* ✅ Show Admin Dashboard Button only if user is logged in */}
        {user && (
          <button
            onClick={handleAdminButtonClick}
            className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600"
          >
            {isAdmin ? "Admin Dashboard" : "Admin Login"}
          </button>
        )}

        {user ? (
          <button
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link href="/login" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
              Login
            </Link>
            <Link href="/signup" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
