// src/components/Navbar.tsx
"use client";
import { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Initial check for user
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    
    fetchUser();
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white border-b">
      <Link href="/" className="flex items-center gap-2">
        <Stethoscope className="h-6 w-6" />
        <h1 className="text-xl font-bold">PulmoSense AI</h1>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link href="/about" className="hover:text-blue-600">About</Link>
        
        {loading ? (
          <span className="text-sm text-gray-500">Loading...</span>
        ) : user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, <span className="font-medium">{user.email?.split('@')[0] || "User"}</span>
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link 
            href="/authentication" 
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}