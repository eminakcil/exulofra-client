// Data Transfer Objects matching openapi.json

export interface LoginCommand {
  email: string
  password?: string // Optional if implementing other auth, but required in schema
}

export interface RegisterCommand {
  email: string
  password?: string
}

export interface RefreshTokenCommand {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
  }
}

export interface CreateSessionCommand {
  type: number // SessionType enum
}

export interface SessionResponse {
  id: string
  type: number
  createdAt: string
}

export interface SegmentResponse {
  id: string
  sourceText: string
  targetText: string
  speakerTag: string
  timestamp: string
}

export interface TranslationResponse {
  id: string
  sourceLang: string
  sourceVoice: string
  targetLang: string
  targetVoice: string
  isMuted: boolean
  createdAt: string
  segments: SegmentResponse[]
}

export interface SessionDetailResponse extends SessionResponse {
  translations: TranslationResponse[]
}

export interface StartTranslationCommand {
  sessionId: string
  sourceLang: string
  sourceVoice: string
  targetLang: string
  targetVoice: string
  isMuted: boolean
  inputAudioUrl?: string | null
  outputAudioUrl?: string | null
}
