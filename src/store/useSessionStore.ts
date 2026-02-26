import { create } from "zustand"

// Assuming SessionType matches the backend enum
export const SessionType = {
  Dubbing: 1,
  Reporting: 2,
  Dialogue: 3,
  Broadcast: 4,
} as const

export type SessionType = (typeof SessionType)[keyof typeof SessionType]

interface SessionState {
  sessionId: string | null
  translationId: string | null
  activeType: SessionType | null
  sourceLang: string
  sourceVoice: string
  targetLang: string
  targetVoice: string
  setSessionId: (id: string, type: SessionType) => void
  setTranslationConfig: (
    translationId: string | null,
    sourceLang: string,
    sourceVoice: string,
    targetLang: string,
    targetVoice: string,
  ) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  translationId: null,
  activeType: null,
  sourceLang: "tr-TR", // Defaults
  sourceVoice: "tr-TR-EmelNeural",
  targetLang: "en-US",
  targetVoice: "en-US-JennyNeural",
  setSessionId: (id, type) => set({ sessionId: id, activeType: type }),
  setTranslationConfig: (tId, sLang, sVoice, tLang, tVoice) =>
    set({
      translationId: tId,
      sourceLang: sLang,
      sourceVoice: sVoice,
      targetLang: tLang,
      targetVoice: tVoice,
    }),
  clearSession: () =>
    set({
      sessionId: null,
      translationId: null,
      activeType: null,
    }),
}))
