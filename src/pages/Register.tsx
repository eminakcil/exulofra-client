import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mic2, ArrowRight, Mail, Lock } from "lucide-react"
import toast from "react-hot-toast"
import { authService } from "../services/auth.service"

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // openapi.json RegisterCommand only needs email and password right now
      await authService.register({ email, password })
      toast.success("Kayıt başarılı! Lütfen giriş yapın.")
      navigate("/login")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Kayıt olurken bir hata oluştu.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col justify-center relative overflow-hidden bg-mesh">
      {/* Decorative Orbs - Positioned differently from Login for variety */}
      <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-5%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 py-12"
      >
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-slate-900 border border-slate-700/50 rounded-xl flex items-center justify-center relative z-10 shadow-lg mb-2">
            <Mic2 className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2
            className="text-3xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Hesap Oluşturun
          </h2>
          <p className="mt-2 text-slate-400 text-base">
            Geleceğin iletişim dünyasına katılın
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 pl-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all sm:text-sm"
                  placeholder="isim@sirket.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 pl-1">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all sm:text-sm"
                  placeholder="En az 8 karakter"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 mt-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-purple-500 transition-all shadow-[0_4px_20px_rgba(147,51,234,0.3)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative flex items-center gap-2">
                {isLoading ? "Hesap Oluşturuluyor..." : "Ücretsiz Kayıt Ol"}
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Zaten bir hesabınız var mı?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            Giriş Yapın
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
