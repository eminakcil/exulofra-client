import { api } from "./api"
import {
  type CreateSessionCommand,
  type SessionResponse,
  type StartTranslationCommand,
} from "../types/api.types"

export const sessionService = {
  createSession: async (
    data: CreateSessionCommand,
  ): Promise<SessionResponse> => {
    const response = await api.post("/sessions", data)

    // If the backend returns a bare string (e.g. stringified Guid), map it properly to SessionResponse
    if (typeof response.data === "string") {
      return {
        id: response.data,
        type: data.type,
        createdAt: new Date().toISOString(),
      } as SessionResponse
    }

    // Safety fallback if backend responds with { sessionId: "..." }
    if (response.data && response.data.sessionId && !response.data.id) {
      return {
        id: response.data.sessionId,
        type: data.type,
        createdAt: new Date().toISOString(),
      } as SessionResponse
    }

    return response.data
  },

  getSessions: async (): Promise<SessionResponse[]> => {
    const response = await api.get<SessionResponse[]>("/sessions")
    return response.data
  },

  getSessionById: async (id: string): Promise<SessionResponse> => {
    const response = await api.get<SessionResponse>(`/sessions/${id}`)
    return response.data
  },

  startTranslation: async (data: StartTranslationCommand): Promise<string> => {
    const response = await api.post("/translations", data)
    if (typeof response.data === "string") {
      return response.data
    }
    return response.data?.id || response.data?.translationId || response.data
  },
}
