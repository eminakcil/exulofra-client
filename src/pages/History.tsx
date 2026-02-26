import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  Play,
  FileText,
  Download,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { SessionType } from "../store/useSessionStore"
import { sessionService } from "../services/session.service"
import type { SessionResponse } from "../types/api.types"
import toast from "react-hot-toast"

const getTypeLabel = (type: number) => {
  switch (type) {
    case SessionType.Dubbing:
      return {
        label: "Dublaj",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      }
    case SessionType.Reporting:
      return {
        label: "Raporlama",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      }
    case SessionType.Dialogue:
      return {
        label: "İletişim",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      }
    case SessionType.Broadcast:
      return {
        label: "Yayın",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      }
    default:
      return {
        label: "Bilinmeyen",
        color: "text-gray-400 bg-gray-500/10 border-gray-500/20",
      }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
}

export default function History() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const data = await sessionService.getSessions()

        // Sort descending by creation date
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setSessions(sortedData)
      } catch {
        toast.error("Geçmiş oturumlar yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const filteredSessions = sessions.filter((s) => {
    // If we have a complex search, we would search title/date strings. We simply use ID or type name for now if needed.
    return s.id.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1
            className="text-3xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Geçmiş Oturumlar
          </h1>
          <p className="text-slate-400 mt-2">
            Önceki çeviri ve dikte kayıtlarınıza buradan ulaşabilirsiniz.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/60 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            placeholder="ID ile ara..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400">Kayıtlarınız getiriliyor...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-slate-400">Hiç oturum bulunamadı.</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredSessions.map((session) => {
              const typeInfo = getTypeLabel(session.type)

              const dateObj = new Date(session.createdAt)
              const formattedDate = dateObj.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              const formattedTime = dateObj.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <motion.div
                  variants={itemVariants}
                  key={session.id}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="group glass border border-slate-800 p-4 md:p-5 rounded-2xl hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute left-0 inset-y-0 w-1 bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 md:w-48 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700">
                      <Calendar className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">
                        {formattedDate}
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {formattedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${typeInfo.color}`}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Oturum: {session.id.split("-")[0]}...
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 pt-4 md:pt-0 shrink-0">
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 tooltip">
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors border border-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
