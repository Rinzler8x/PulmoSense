import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  )
}

