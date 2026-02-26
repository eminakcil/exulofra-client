import { api } from "./api"
import {
  type LoginCommand,
  type RegisterCommand,
  type AuthResponse,
  type RefreshTokenCommand,
} from "../types/api.types"
import { useAuthStore } from "../store/useAuthStore"

export const authService = {
  login: async (data: LoginCommand): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data)
    return response.data
  },

  register: async (data: RegisterCommand): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data)
    return response.data
  },

  me: async (): Promise<any> => {
    const response = await api.get("/auth/me")
    return response.data
  },

  refreshToken: async (data: RefreshTokenCommand): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh-token", data)
    return response.data
  },

  logout: () => {
    useAuthStore.getState().logout()
  },
}
