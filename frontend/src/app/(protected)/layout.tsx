// src/app/(protected)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/authentication')
      } else {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return <>{children}</>
}