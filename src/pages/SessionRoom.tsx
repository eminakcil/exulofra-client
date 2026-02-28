import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSessionStore, SessionType } from "../store/useSessionStore"
import {
  Mic,
  X,
  Radio,
  Loader2,
  Settings,
  Maximize,
  Minimize,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import {
  useSignalR,
  type TranslationSegment,
  type PartialSegment,
} from "../hooks/useSignalR"
import { useMicrophone } from "../hooks/useMicrophone"
import { sessionService } from "../services/session.service"
import type { SessionDetailResponse } from "../types/api.types"
import toast from "react-hot-toast"

interface ModeViewProps {
  isRecording: boolean
  toggleMic: () => void
  translations: TranslationSegment[]
  partialText: PartialSegment | null
  playingSegmentId: string | null
}

const SessionHeader = ({
  title,
  onEnd,
  onSettings,
}: {
  title: string
  onEnd: () => void
  onSettings: () => void
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
        <span className="text-slate-200 font-medium tracking-wide text-sm">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleFullscreen}
          className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 px-3 py-2 rounded-full transition-all flex items-center justify-center"
          title="Tam Ekran"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onSettings}
          className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 text-sm font-medium px-4 py-2 rounded-full transition-all flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Ayarlar</span>
        </button>
        <button
          onClick={onEnd}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-medium px-4 py-2 rounded-full transition-all flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>Bitir</span>
        </button>
      </div>
    </header>
  )
}

const ChatBubble = ({
  source,
  target,
  isPartial = false,
  speakerTag,
  onlySource = false,
  isActive = false,
}: {
  source: string
  target: string
  isPartial?: boolean
  speakerTag?: string
  onlySource?: boolean
  isActive?: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex flex-col gap-1 md:gap-2 p-4 md:p-6 rounded-3xl max-w-3xl mx-auto w-full transition-all duration-300 ${
      isActive
        ? "bg-slate-800/90 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        : isPartial
          ? "bg-slate-800/40 border border-slate-700/50 shadow-inner"
          : "bg-slate-800/80 border border-slate-700/80 shadow-lg"
    }`}
  >
    <div className="flex items-center justify-between mb-1">
      {target && !onlySource ? (
        <p
          className={`text-sm md:text-base font-medium ${isPartial ? "text-slate-500" : "text-slate-400"}`}
        >
          {source}
        </p>
      ) : null}

      {speakerTag && (
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md">
          {speakerTag}
        </span>
      )}
    </div>
    <p
      className={`text-2xl md:text-4xl font-bold leading-tight tracking-tight ${
        isPartial ? "text-slate-300 animate-pulse" : "text-white"
      }`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {onlySource
        ? source || (isPartial ? "..." : "")
        : target || (isPartial ? "..." : "")}
    </p>
  </motion.div>
)

const ChatHistoryView = ({
  isRecording,
  toggleMic,
  translations,
  partialText,
  playingSegmentId,
}: ModeViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [translations, partialText])

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col pt-20 pb-4 relative bg-slate-950">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pb-40 scroll-smooth px-4 sm:px-6"
      >
        {translations.length === 0 && !partialText && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 font-medium space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Mic className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-lg">Dinliyorum, konuşmaya başlayın...</p>
          </div>
        )}
        {translations.map((t, idx) => (
          <ChatBubble
            key={t.id || idx}
            source={t.sourceText}
            target={t.targetText}
            speakerTag={t.speakerTag}
            onlySource={true} // Reporting only shows source naturally
            isActive={t.id === playingSegmentId}
          />
        ))}
        {partialText && (
          <ChatBubble
            source={partialText.sourceText}
            target={partialText.targetText}
            speakerTag={partialText.speakerTag}
            isPartial
            onlySource={true}
          />
        )}
      </div>

      {/* Mic Button Layout */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-end justify-center pb-8 pointer-events-none">
        <button
          onClick={toggleMic}
          className={`relative group flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 pointer-events-auto shadow-2xl ${
            isRecording
              ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110"
              : "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-105"
          }`}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
          )}
          <Mic
            className={`w-10 h-10 ${isRecording ? "text-white animate-pulse" : "text-white"}`}
          />
        </button>
      </div>
    </div>
  )
}

// 4. Dubbing View (Option 1 Focus View)
const DubbingView = ({
  isRecording,
  toggleMic,
  translations,
  partialText,
  playingSegmentId,
}: ModeViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [translations, partialText])

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col pt-20 pb-4 relative bg-slate-950">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-40 scroll-smooth px-4 sm:px-8 max-w-5xl mx-auto w-full"
      >
        {translations.length === 0 && !partialText && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 font-medium space-y-4">
            <p className="text-xl">Dublaj için konuşmaya başlayın...</p>
          </div>
        )}
        {translations.map((t, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={t.id || idx}
            className={`flex flex-col gap-2 p-6 md:p-8 rounded-3xl transition-all duration-300 ${
              t.id === playingSegmentId
                ? "bg-slate-900/80 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : "bg-slate-900/50 border border-slate-800 shadow-md"
            }`}
          >
            {/* Source Text (Spoken) - Preview */}
            <p className="text-lg md:text-xl font-medium text-amber-500/90 pl-2 border-l-2 border-amber-500/50">
              {t.sourceText}
            </p>
            {/* Target Text (Translated) - Main Focus */}
            <p
              className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mt-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.targetText}
            </p>
          </motion.div>
        ))}
        {partialText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2 p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50"
          >
            <p className="text-lg md:text-xl font-medium text-amber-500/50 pl-2 border-l-2 border-amber-500/30 animate-pulse">
              {partialText.sourceText || "..."}
            </p>
            <p
              className="text-3xl md:text-5xl font-bold text-slate-300 animate-pulse leading-tight tracking-tight mt-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {partialText.targetText || "..."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Mic Button Layout */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-end justify-center pb-8 pointer-events-none">
        <button
          onClick={toggleMic}
          className={`relative group flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 pointer-events-auto shadow-2xl ${
            isRecording
              ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110"
              : "bg-amber-600 shadow-[0_0_30px_rgba(217,119,6,0.3)] hover:bg-amber-500 hover:scale-105"
          }`}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
          )}
          <Mic
            className={`w-10 h-10 ${isRecording ? "text-white animate-pulse" : "text-white"}`}
          />
        </button>
      </div>
    </div>
  )
}

// 5. Dialogue View (Split Screen Front-to-Face)
const DialogueView = ({
  isRecording,
  toggleMic,
  translations,
  partialText,
  playingSegmentId,
}: ModeViewProps) => {
  const topScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollRef = useRef<HTMLDivElement>(null)
  const { sourceLang } = useSessionStore()

  useEffect(() => {
    if (topScrollRef.current) {
      topScrollRef.current.scrollTop = topScrollRef.current.scrollHeight
    }
    if (bottomScrollRef.current) {
      bottomScrollRef.current.scrollTop = bottomScrollRef.current.scrollHeight
    }
  }, [translations, partialText])

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col relative bg-slate-950">
      {/* Top Half - Flipped 180 degrees for the other person */}
      <div className="flex-1 bg-slate-900 border-b-4 border-slate-950 flex flex-col relative overflow-hidden">
        {/* Rotate the entire container 180deg so the counterpart reads it naturally */}
        <div className="absolute inset-0 rotate-180 flex flex-col p-4 sm:p-6 pb-16">
          {/* We use pb-32 to avoid the mic button overlapping the middle later */}
          <div
            ref={topScrollRef}
            className="flex-1 overflow-y-auto space-y-4 scroll-smooth pr-2"
          >
            {translations.length === 0 && !partialText && (
              <div className="h-full flex items-center justify-center text-slate-500">
                <p className="text-xl">Waiting for conversation...</p>
              </div>
            )}
            {translations.map((t, idx) => {
              const isRemote = t.speakerTag && t.speakerTag !== sourceLang
              const remoteMainText = isRemote ? t.sourceText : t.targetText
              const remoteSubText = isRemote ? t.targetText : t.sourceText
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={t.id || idx}
                  className={`border p-5 rounded-3xl max-w-2xl mx-auto w-full transition-all duration-300 ${
                    t.id === playingSegmentId
                      ? "bg-blue-600/40 border-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                      : "bg-blue-600/20 border-blue-500/30 shadow-lg"
                  }`}
                >
                  <p
                    className="text-3xl md:text-5xl font-bold text-white text-center"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {remoteMainText}
                  </p>
                  <p className="text-sm text-blue-300/60 mt-2 text-center">
                    {remoteSubText}
                  </p>
                </motion.div>
              )
            })}
            {partialText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl max-w-2xl mx-auto w-full"
              >
                <p
                  className="text-3xl md:text-5xl font-bold text-slate-300 animate-pulse text-center"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {partialText.speakerTag &&
                  partialText.speakerTag !== sourceLang
                    ? partialText.sourceText || "..."
                    : partialText.targetText || "..."}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mic Button in the exact center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <button
          onClick={toggleMic}
          className={`flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 shadow-2xl ${
            isRecording
              ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110"
              : "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-105"
          }`}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
          )}
          <Mic
            className={`w-8 h-8 sm:w-10 sm:h-10 ${isRecording ? "text-white animate-pulse" : "text-white"}`}
          />
        </button>
      </div>

      {/* Bottom Half - Normal orientation for the user */}
      <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col p-4">
          {/* pt-28 avoids mic overlap */}
          <div
            ref={bottomScrollRef}
            className="flex-1 overflow-y-auto space-y-4 scroll-smooth pr-2"
          >
            {translations.length === 0 && !partialText && (
              <div className="h-full flex items-center justify-center text-slate-500">
                <p className="text-xl">Dinliyorum, konuşmaya başlayın...</p>
              </div>
            )}
            {translations.map((t, idx) => {
              const isRemote = t.speakerTag && t.speakerTag !== sourceLang
              const localMainText = isRemote ? t.targetText : t.sourceText
              const localSubText = isRemote ? t.sourceText : t.targetText
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`b-${t.id || idx}`}
                  className={`border p-5 rounded-3xl max-w-2xl mx-auto w-full transition-all duration-300 ${
                    t.id === playingSegmentId
                      ? "bg-slate-800/95 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-slate-800/80 border-slate-700/80 shadow-lg"
                  }`}
                >
                  <p
                    className="text-3xl md:text-5xl font-bold text-white text-center"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {localMainText}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 text-center">
                    {localSubText}
                  </p>
                </motion.div>
              )
            })}
            {partialText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl max-w-2xl mx-auto w-full"
              >
                <p
                  className="text-3xl md:text-5xl font-bold text-slate-300 animate-pulse text-center"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {partialText.speakerTag &&
                  partialText.speakerTag !== sourceLang
                    ? partialText.targetText || "..."
                    : partialText.sourceText || "..."}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 5. Broadcast View
const BroadcastView = ({
  isRecording,
  toggleMic,
  translations,
  partialText,
  playingSegmentId,
}: ModeViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [translations, partialText])

  return (
    <div className="flex-1 min-h-0 w-full bg-black relative overflow-hidden flex flex-col">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-black to-black" />

      <div className="flex-1 flex flex-col justify-end pb-24 pt-20 px-4 md:px-12 relative z-10 w-full">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 md:space-y-8 scroll-smooth w-full flex flex-col justify-end"
        >
          {translations.length === 0 && !partialText && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto w-full text-center mt-auto"
              >
                <p
                  className="text-3xl md:text-5xl font-bold text-white/50 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] leading-snug"
                  style={{
                    textShadow:
                      "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                >
                  Yönlendirmeye hazırım...
                </p>
              </motion.div>
            </AnimatePresence>
          )}

          <AnimatePresence>
            {translations.map((t, idx) => (
              <motion.div
                key={t.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className={`max-w-4xl mx-auto w-full text-center transition-all duration-300 rounded-2xl p-4 ${
                  t.id === playingSegmentId
                    ? "bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    : ""
                }`}
              >
                <p
                  className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)] leading-snug"
                  style={{
                    textShadow:
                      "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                >
                  {t.targetText}
                </p>
              </motion.div>
            ))}

            {partialText && (
              <motion.div
                key="partial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto w-full text-center"
              >
                <p
                  className="text-3xl md:text-5xl font-bold text-white/80 animate-pulse drop-shadow-[0_4px_4px_rgba(0,0,0,1)] leading-snug"
                  style={{
                    textShadow:
                      "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                  }}
                >
                  {partialText.targetText || "..."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 pointer-events-none">
        <button
          onClick={toggleMic}
          className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all shadow-2xl ${
            isRecording
              ? "bg-rose-600 text-white shadow-[0_0_50px_rgba(225,29,72,0.4)]"
              : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:shadow-[0_0_30px_rgba(30,41,59,0.5)]"
          }`}
        >
          <Radio className={`w-5 h-5 ${isRecording ? "animate-pulse" : ""}`} />
          <span>
            {isRecording ? "Sistem Sesi Dinleniyor..." : "Sistem Sesini Başlat"}
          </span>
        </button>
      </div>
    </div>
  )
}

export default function SessionRoom() {
  const navigate = useNavigate()
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>()
  const {
    activeType,
    clearSession,
    translationId,
    setTranslationConfig,
    setSessionId,
  } = useSessionStore()

  // Data fetching state
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Audio playback queue
  const audioQueueRef = useRef<{ segmentId: string; audioDataUrl: string }[]>(
    [],
  )
  const isPlayingRef = useRef<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null)

  // Core Realtime States
  const [translations, setTranslations] = useState<TranslationSegment[]>([])
  const [partialText, setPartialText] = useState<PartialSegment | null>(null)

  // Initialization & Fetching History
  useEffect(() => {
    if (!routeSessionId) return

    const loadSession = async () => {
      try {
        setIsDataLoading(true)
        const data = (await sessionService.getSessionById(
          routeSessionId,
        )) as SessionDetailResponse

        // **Critical fix**: Always sync the store's session details to the current route's session
        setSessionId(routeSessionId, data.type as SessionType)

        // Flatten all past segments across translations to recreate the Chat History
        const historicalSegments: TranslationSegment[] = []

        if (data.translations?.length > 0) {
          // Keep track of the most recent translation config
          const lastTranslation =
            data.translations[data.translations.length - 1]

          setTranslationConfig(
            lastTranslation.id,
            lastTranslation.sourceLang,
            lastTranslation.sourceVoice || "tr-TR-EmelNeural",
            lastTranslation.targetLang,
            lastTranslation.targetVoice,
          )

          data.translations.forEach((tr) => {
            if (tr.segments) {
              historicalSegments.push(...tr.segments)
            }
          })
          setTranslations(historicalSegments)
        } else {
          // Reset the translation config if there are no translations in this session
          setTranslationConfig(
            null,
            "tr-TR",
            "tr-TR-EmelNeural",
            "en-US",
            "en-US-JennyNeural",
          )
        }
      } catch (err) {
        console.error(err)
        toast.error("Oturum detayları yüklenemedi.")
        navigate("/dashboard")
      } finally {
        setIsDataLoading(false)
      }
    }

    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSessionId])

  // 1. Microphone Hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: micError,
  } = useMicrophone()

  // 2. Playback System
  const playNextAudio = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      setPlayingSegmentId(null)
      return
    }

    isPlayingRef.current = true
    const nextItem = audioQueueRef.current.shift()!
    setPlayingSegmentId(nextItem.segmentId)

    if (audioRef.current) {
      audioRef.current.src = nextItem.audioDataUrl
      audioRef.current.play().catch((e) => {
        console.warn("Audio play failed:", e)
        playNextAudio() // Skip and try next if error
      })
    }
  }

  // 3. SignalR Hook
  const {
    isConnected,
    startAudioStream,
    sendAudioChunk,
    stopAudioStream,
    error: hubError,
  } = useSignalR({
    translationId: translationId || null,
    onReceivePartial: (partial) => {
      setPartialText(partial)
    },
    onReceiveTranslation: (segment) => {
      setTranslations((prev) => [...prev, segment])
      setPartialText(null) // Clear partial when full translation arrives
    },
    onReceiveAudio: (segmentId, base64Audio) => {
      // Form a data URI from the base64 string.
      const audioDataUrl = `data:audio/wav;base64,${base64Audio}`

      // Queue audio for TTS playback
      audioQueueRef.current.push({ segmentId, audioDataUrl })
      if (!isPlayingRef.current) {
        playNextAudio()
      }
    },
    onSessionEnded: () => {
      toast.success("Oturum karşı taraf veya sistem tarafından sonlandırıldı.")
      handleEnd()
    },
  })

  // Handle errors
  useEffect(() => {
    if (micError) toast.error(micError)
    if (hubError) toast.error("Sunucu ile bağlantı koptu.")
  }, [micError, hubError])

  const handleEnd = () => {
    stopRecording()
    stopAudioStream()
    if (audioRef.current) {
      audioRef.current.pause()
    }
    clearSession()
    navigate("/history")
  }

  const handleSettings = () => {
    if (activeType && routeSessionId) {
      useSessionStore.setState({ sessionId: routeSessionId })
      navigate(`/sessions/${routeSessionId}/setup`)
    }
  }

  const toggleMic = async () => {
    // Force play the silent audio ref to bypass iOS Safari restrictions
    // This requires a direct user interaction event loop
    if (audioRef.current && audioRef.current.src === "") {
      // Provide a tiny silent data URI so it doesn't fail on empty src
      audioRef.current.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      audioRef.current.play().catch(() => {})
    }

    // If we're already recording, stop
    if (isRecording) {
      stopRecording()
      stopAudioStream()
      return
    }

    // Try to start capturing audio and pushing it to SignalR
    try {
      if (!isConnected) {
        toast.error("Bağlantı bekleniyor...")
        return
      }

      // Tell backend we are starting a stream
      await startAudioStream()

      // Determine if we need system audio based on mode
      const isSystem = activeType === SessionType.Broadcast

      // Start the mic/system capture and pipe chunks directly to SignalR stream
      await startRecording({
        isSystemAudio: isSystem,
        sampleRate: 16000,
        onAudioData: (pcmChunk) => {
          sendAudioChunk(pcmChunk)
        },
      })
    } catch {
      // Error is handled in the hooks, but we stop the stream if it fails
      stopAudioStream()
    }
  }

  if (isDataLoading) {
    return (
      <div className="flex-1 h-full w-full flex flex-col items-center justify-center relative bg-slate-950 text-slate-200">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-medium">Oturum Yükleniyor...</h2>
        <p className="text-sm text-slate-400 mt-2">
          Geçmiş veriler getiriliyor, lütfen bekleyin.
        </p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex-1 h-full w-full flex flex-col items-center justify-center relative bg-slate-950 text-slate-200">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-medium">Bağlantı Kuruluyor...</h2>
        <p className="text-sm text-slate-400 mt-2">
          Çeviri sunucusuna bağlanılıyor, lütfen bekleyin.
        </p>
      </div>
    )
  }

  // Render the appropriate Mode UI
  const renderMode = () => {
    switch (activeType) {
      case SessionType.Dubbing:
        return (
          <DubbingView
            isRecording={isRecording}
            toggleMic={toggleMic}
            translations={translations}
            partialText={partialText}
            playingSegmentId={playingSegmentId}
          />
        )
      case SessionType.Reporting:
        return (
          <ChatHistoryView
            isRecording={isRecording}
            toggleMic={toggleMic}
            translations={translations}
            partialText={partialText}
            playingSegmentId={playingSegmentId}
          />
        )
      case SessionType.Dialogue:
        return (
          <DialogueView
            isRecording={isRecording}
            toggleMic={toggleMic}
            translations={translations}
            partialText={partialText}
            playingSegmentId={playingSegmentId}
          />
        )
      case SessionType.Broadcast:
        return (
          <BroadcastView
            isRecording={isRecording}
            toggleMic={toggleMic}
            translations={translations}
            partialText={partialText}
            playingSegmentId={playingSegmentId}
          />
        )
      default:
        return (
          <ChatHistoryView
            isRecording={isRecording}
            toggleMic={toggleMic}
            translations={translations}
            partialText={partialText}
            playingSegmentId={playingSegmentId}
          />
        )
    }
  }

  const modeTitles = {
    [SessionType.Dubbing]: "Çeviri / Dublaj Modu",
    [SessionType.Reporting]: "Kayıt & Raporlama Modu",
    [SessionType.Dialogue]: "İkili İletişim Modu",
    [SessionType.Broadcast]: "Canlı Yayın Modu",
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden relative bg-slate-950 flex flex-col">
      <SessionHeader
        title={activeType ? modeTitles[activeType] : "Bilinmeyen Mod"}
        onEnd={handleEnd}
        onSettings={handleSettings}
      />
      {renderMode()}

      {/* Persistent Audio node for iOS Safari tracking and stable playback */}
      <audio ref={audioRef} onEnded={playNextAudio} className="hidden" />
    </div>
  )
}
