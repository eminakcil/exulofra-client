import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mic2, ArrowRight, Mail, Lock } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import { authService } from "../services/auth.service"
import toast from "react-hot-toast"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = { email, password }
      const response = await authService.login(data)
      login(
        { id: response.user?.id || "unknown", email: data.email },
        response.accessToken,
        response.refreshToken,
      ) // We should also store the refresh token if needed, but access_token is handled by login
      if (response.refreshToken) {
        localStorage.setItem("refresh_token", response.refreshToken)
      }
      toast.success("Giriş başarılı!")
      navigate("/dashboard")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Giriş yapılamadı. Bilgilerinizi kontrol edin.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col justify-center relative overflow-hidden bg-mesh">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4"
      >
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/40 blur-xl rounded-full scale-110 group-hover:bg-cyan-400/50 group-hover:scale-125 transition-all duration-500" />
            <div className="h-16 w-16 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center relative z-10 shadow-2xl">
              <Mic2 className="w-8 h-8 text-blue-400 group-hover:text-cyan-300 transition-colors duration-300" />
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2
            className="text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Hoş Geldiniz
          </h2>
          <p className="mt-3 text-slate-400 text-lg">
            Sınırsız çeviri deneyimine devam edin
          </p>
        </div>

        <div className="glass rounded-[2rem] p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm"
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
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-400 hover:text-cyan-300 transition-colors"
                >
                  Şifremi unuttum
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-blue-500 transition-all overflow-hidden shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div
                className={`absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out ${isLoading ? "animate-pulse translate-y-0" : ""}`}
              />
              <span className="relative flex items-center gap-2">
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Henüz hesabınız yok mu?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-400 hover:text-cyan-300 transition-colors"
          >
            Ücretsiz Kayıt Olun
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
