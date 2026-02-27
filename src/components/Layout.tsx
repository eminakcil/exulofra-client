import { Outlet, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { LogOut, Home, History as HistoryIcon } from "lucide-react"

export function Layout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-950 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex-none z-20 flex justify-between items-center text-slate-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-50 font-bold tracking-tight hover:text-white transition"
          >
            <Home className="w-5 h-5 text-blue-500" />
            <span>ExulofraClient</span>
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-800 transition text-sm"
          >
            <HistoryIcon className="w-4 h-4" />
            <span>Geçmiş</span>
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Çıkış Yap</span>
        </button>
      </header>
      <main className="flex-1 overflow-y-auto flex flex-col relative w-full h-full">
        <Outlet />
      </main>
    </div>
  )
}
