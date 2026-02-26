import { useState, useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useSessionStore, SessionType } from "../store/useSessionStore"
import {
  Globe2,
  Volume2,
  ArrowRight,
  Settings2,
  MicOff,
  Mic,
} from "lucide-react"
import { sessionService } from "../services/session.service"
import toast from "react-hot-toast"

// Language mapping with respective Neural voices
const LANGUAGES = [
  {
    code: "tr-TR",
    label: "Türkçe (Türkiye)",
    femaleVoice: "tr-TR-EmelNeural",
    maleVoice: "tr-TR-AhmetNeural",
  },
  {
    code: "en-US",
    label: "English (US)",
    femaleVoice: "en-US-AvaNeural",
    maleVoice: "en-US-AndrewNeural",
  },
  {
    code: "zh-CN",
    label: "Chinese (Mandarin, Simplified)",
    femaleVoice: "zh-CN-XiaoxiaoNeural",
    maleVoice: "zh-CN-YunxiNeural",
  },
  {
    code: "es-ES",
    label: "Spanish (Spain)",
    femaleVoice: "es-ES-ElviraNeural",
    maleVoice: "es-ES-AlvaroNeural",
  },
  {
    code: "hi-IN",
    label: "Hindi (India)",
    femaleVoice: "hi-IN-AnanyaNeural",
    maleVoice: "hi-IN-AaravNeural",
  },
  {
    code: "ar-EG",
    label: "Arabic (Egypt)",
    femaleVoice: "ar-EG-SalmaNeural",
    maleVoice: "ar-EG-ShakirNeural",
  },
  {
    code: "pt-BR",
    label: "Portuguese (Brazil)",
    femaleVoice: "pt-BR-FranciscaNeural",
    maleVoice: "pt-BR-AntonioNeural",
  },
  {
    code: "fr-FR",
    label: "French (France)",
    femaleVoice: "fr-FR-DeniseNeural",
    maleVoice: "fr-FR-HenriNeural",
  },
  {
    code: "ru-RU",
    label: "Russian (Russia)",
    femaleVoice: "ru-RU-SvetlanaNeural",
    maleVoice: "ru-RU-DmitryNeural",
  },
  {
    code: "de-DE",
    label: "German (Germany)",
    femaleVoice: "de-DE-KatjaNeural",
    maleVoice: "de-DE-ConradNeural",
  },
  {
    code: "ja-JP",
    label: "Japanese (Japan)",
    femaleVoice: "ja-JP-NanamiNeural",
    maleVoice: "ja-JP-KeitaNeural",
  },
]

export default function Setup() {
  const navigate = useNavigate()
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get("type")
  const sessionType = typeParam ? parseInt(typeParam, 10) : null

  const {
    sessionId: storeSessionId,
    activeType: storeActiveType,
    setSessionId,
    setTranslationConfig,
  } = useSessionStore()

  // If we have a route param, use it. Otherwise, if not creating, fallback to store.
  // Note: if creating, routeSessionId is undefined
  const isCreating = !routeSessionId
  const activeSessionId = routeSessionId || storeSessionId
  const activeType = isCreating ? sessionType : storeActiveType

  const [sourceLang, setSourceLang] = useState("tr-TR")
  const [targetLang, setTargetLang] = useState("en-US")
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female")
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Determine if we should hide the audio output settings (Reporting = 2, Broadcast = 3)
  const shouldHideAudioOutput = useMemo(() => {
    return (
      activeType === SessionType.Reporting ||
      activeType === SessionType.Broadcast
    )
  }, [activeType])

  const shouldHideTargetConfig = activeType === SessionType.Reporting

  const handleStart = async () => {
    if (isCreating && !sessionType) {
      toast.error("Oturum türü belirtilmemiş. Lütfen tekrar deneyin.")
      return navigate("/dashboard")
    }

    if (!isCreating && !activeSessionId) {
      toast.error("Oturum bilgisi bulunamadı. Lütfen tekrar deneyin.")
      return navigate("/dashboard")
    }

    const selectedTargetLang = LANGUAGES.find((l) => l.code === targetLang)
    const targetVoice = selectedTargetLang
      ? voiceGender === "female"
        ? selectedTargetLang.femaleVoice
        : selectedTargetLang.maleVoice
      : "en-US-AvaNeural"

    const selectedSourceLang = LANGUAGES.find((l) => l.code === sourceLang)
    const sourceVoice = selectedSourceLang
      ? voiceGender === "female"
        ? selectedSourceLang.femaleVoice
        : selectedSourceLang.maleVoice
      : "tr-TR-EmelNeural"

    // If the mode doesn't support audio output (Reporting, Broadcast), ignore the state toggle and send true
    const finalMutedState = shouldHideAudioOutput ? true : isMuted
    const finalTargetLang = shouldHideTargetConfig ? sourceLang : targetLang

    setIsLoading(true)
    try {
      let finalSessionId = activeSessionId

      // 1. Create the session if in create flow
      if (isCreating && sessionType) {
        const response = await sessionService.createSession({
          type: sessionType as SessionType,
        })
        finalSessionId = response.id
        setSessionId(response.id, sessionType as SessionType)
      }

      if (!finalSessionId) throw new Error("Oturum id si oluşturulamadı.")

      // 2. Start the translation logic
      const translationId = await sessionService.startTranslation({
        sessionId: finalSessionId,
        sourceLang,
        sourceVoice,
        targetLang: finalTargetLang,
        targetVoice,
        isMuted: finalMutedState,
      })

      setTranslationConfig(
        translationId,
        sourceLang,
        sourceVoice,
        finalTargetLang,
        targetVoice,
      )
      navigate(`/sessions/${finalSessionId}`)
    } catch {
      toast.error("İşlem sırasında bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-full flex flex-col justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto w-full space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center shadow-lg text-blue-400">
              <Settings2 className="w-7 h-7" />
            </div>
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Oturum Ayarları
          </h1>
          <p className="text-slate-400 text-base">
            Çeviri dillerini ve sentezlenecek ses rengini seçin.
          </p>
          {activeSessionId && !isCreating && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
              <span className="text-xs text-slate-400">Oturum ID:</span>
              <span className="text-xs font-mono text-slate-300 select-all">
                {activeSessionId}
              </span>
            </div>
          )}
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Subtle highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {/* Source Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 pl-1">
              <Globe2 className="w-4 h-4 text-slate-500" />
              Sizin Diliniz (Kaynak)
            </label>
            <div className="relative">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="appearance-none block w-full pl-4 pr-10 py-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium sm:text-sm cursor-pointer"
              >
                {LANGUAGES.map((ext) => (
                  <option key={ext.code} value={ext.code}>
                    {ext.label} ({ext.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Target Language */}
          {!shouldHideTargetConfig && (
            <>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2 pl-1">
                  <Globe2 className="w-4 h-4 text-blue-400" />
                  Karşı Tarafın Dili (Hedef)
                </label>
                <div className="relative">
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="appearance-none block w-full pl-4 pr-10 py-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium sm:text-sm cursor-pointer"
                  >
                    {LANGUAGES.map((ext) => (
                      <option key={ext.code} value={ext.code}>
                        {ext.label} ({ext.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Target Voice Gender Toggle */}
          {!shouldHideAudioOutput && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 pl-1">
                <Volume2 className="w-4 h-4 text-purple-400" />
                Sentezlenecek Ses (Cinsiyet)
              </label>
              <div className="flex bg-slate-950/60 border border-slate-700/60 rounded-xl overflow-hidden p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setVoiceGender("female")}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                    voiceGender === "female"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  Kadın
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender("male")}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                    voiceGender === "male"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  Erkek
                </button>
              </div>
            </div>
          )}

          {/* Mute Toggle (Hidden for Reporting Contexts where Mute is Forced) */}
          {!shouldHideAudioOutput && (
            <>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

              <div
                className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-700/60 transition-all cursor-pointer hover:border-slate-600/60"
                onClick={() => setIsMuted(!isMuted)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isMuted ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                  >
                    {isMuted ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Sessiz Mod (Muted)
                    </p>
                    <p className="text-xs text-slate-400">
                      Karşı tarafa ses gitmesini engeller
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMuted ? "bg-blue-600" : "bg-slate-700"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMuted ? "translate-x-6" : "translate-x-1"}`}
                  />
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleStart}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-4 px-4 mt-8 border border-transparent rounded-xl text-base font-bold text-slate-950 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div
              className={`absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out ${isLoading ? "animate-pulse translate-y-0" : ""}`}
            />
            <span className="relative flex items-center gap-2">
              {isLoading
                ? "Başlatılıyor..."
                : shouldHideTargetConfig
                  ? "Kayıt-Raporlama Başlat"
                  : "Çeviriyi Başlat"}
              {!isLoading && (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
