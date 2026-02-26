import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { SessionType } from "../store/useSessionStore"
import {
  Mic2,
  FileText,
  MessageSquareMore,
  Radio,
  ArrowRight,
} from "lucide-react"

const MODES = [
  {
    id: SessionType.Dubbing,
    title: "Çeviri / Dublaj",
    desc: "Konuşmanızı anında başka bir dilde sesli olarak sentezleyin ve aktarın.",
    icon: Mic2,
    colors: {
      from: "from-blue-500/20",
      to: "to-cyan-500/5",
      border: "hover:border-blue-500/50",
      icon: "text-blue-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    },
  },
  {
    id: SessionType.Reporting,
    title: "Kayıt & Raporlama",
    desc: "Oturumlarınızı transkript halinde saklayın. Sadece dikte ve metin dökümü.",
    icon: FileText,
    colors: {
      from: "from-emerald-500/20",
      to: "to-teal-500/5",
      border: "hover:border-emerald-500/50",
      icon: "text-emerald-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    },
  },
  {
    id: SessionType.Dialogue,
    title: "İkili İletişim",
    desc: "Telefonu masaya koyun, iki farklı dilde yüz yüze kesintisiz iletişim kurun.",
    icon: MessageSquareMore,
    colors: {
      from: "from-purple-500/20",
      to: "to-fuchsia-500/5",
      border: "hover:border-purple-500/50",
      icon: "text-purple-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    },
  },
  {
    id: SessionType.Broadcast,
    title: "Canlı Yayın",
    desc: "Sistem veya sekme sesini yakalayın, ekranda sinematik altyazılar oluşturun.",
    icon: Radio,
    colors: {
      from: "from-rose-500/20",
      to: "to-orange-500/5",
      border: "hover:border-rose-500/50",
      icon: "text-rose-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    },
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
}

export default function Dashboard() {
  const navigate = useNavigate()

  const handleSelectMode = (type: SessionType) => {
    navigate(`/sessions/create?type=${type}`)
  }

  return (
    <div className="min-h-full p-4 md:p-8 lg:p-12 max-w-7xl mx-auto relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12"
      >
        <h1
          className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Senaryo <span className="text-gradient">Seçin</span>
        </h1>
        <p className="text-slate-400 mt-3 text-lg max-w-2xl leading-relaxed">
          Amacınıza en uygun çeviri modunu seçerek başlayın. Yapay zeka destekli
          altyapımız, her senaryo için kusursuz bir deneyim sunar.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {MODES.map((mode) => {
          const Icon = mode.icon
          return (
            <motion.button
              variants={itemVariants}
              key={mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`group text-left p-6 md:p-8 rounded-[2rem] bg-slate-900 border border-slate-800 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start gap-6 ${mode.colors.border} ${mode.colors.glow}`}
            >
              {/* Animated Background Gradient inside Card */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mode.colors.from} ${mode.colors.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div
                  className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out`}
                >
                  <Icon className={`w-8 h-8 ${mode.colors.icon}`} />
                </div>
              </div>

              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-2xl font-bold text-slate-50"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {mode.title}
                  </h3>
                  <ArrowRight
                    className={`w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${mode.colors.icon}`}
                  />
                </div>
                <p className="text-slate-400 text-base leading-relaxed font-medium">
                  {mode.desc}
                </p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
