import { create } from "zustand"

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  login: (user, token, refreshToken) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("refresh_token", refreshToken)
    set({ user, token, refreshToken, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
  },
}))
