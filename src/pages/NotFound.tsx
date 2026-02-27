import { Link } from "react-router-dom"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-extrabold text-slate-800">404</h1>
        <h2 className="text-2xl font-semibold text-slate-50">
          Sayfa Bulunamadı
        </h2>
        <p className="text-slate-400 max-w-sm mx-auto">
          Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak
          kullanılamıyor olabilir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          <Home className="w-5 h-5" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  )
}
