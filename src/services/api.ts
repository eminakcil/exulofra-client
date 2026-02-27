import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "../store/useAuthStore"
import toast from "react-hot-toast"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5164"

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// For request deduplication and aborting
const pendingRequests = new Map<string, AbortController>()

const generateRequestKey = (config: InternalAxiosRequestConfig) => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`
}

api.interceptors.request.use(
  (config) => {
    // 1. Deduplication / Abort previous identical request
    const requestKey = generateRequestKey(config)
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey)
      controller?.abort("Duplicate request cancelled")
      pendingRequests.delete(requestKey)
    }

    const controller = new AbortController()
    config.signal = controller.signal
    pendingRequests.set(requestKey, controller)

    // 2. Token Injection
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Token Rotation State
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

api.interceptors.response.use(
  (response) => {
    // Remove from pending requests on success
    const requestKey = generateRequestKey(
      response.config as InternalAxiosRequestConfig,
    )
    pendingRequests.delete(requestKey)
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (originalRequest) {
      const requestKey = generateRequestKey(originalRequest)
      pendingRequests.delete(requestKey)
    }

    // Handle cancellation silently
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // Token Rotation
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Avoid infinite loops
      originalRequest._retry = true

      const { refreshToken, logout, user } = useAuthStore.getState()

      if (!refreshToken) {
        toast.error("Oturumunuz süresi doldu, lütfen tekrar giriş yapın.")
        logout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If already refreshing, wait for the new token
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              if (typeof originalRequest.headers.set === "function") {
                originalRequest.headers.set("Authorization", `Bearer ${token}`)
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
            }
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        // Call refresh token endpoint
        // NOTE: We use axios directly here instead of 'api' to avoid interceptor loops if refresh itself returns 401
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        })

        const newAccessToken = response.data.accessToken
        const newRefreshToken = response.data.refreshToken

        // Ensure user is not null, otherwise fallback or logout
        if (user) {
          useAuthStore.getState().login(user, newAccessToken, newRefreshToken)
        }

        // Retry queued requests
        onRefreshed(newAccessToken)

        // Retry current failed request
        if (originalRequest.headers) {
          if (typeof originalRequest.headers.set === "function") {
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`,
            )
          } else {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh token failed, force logout
        toast.error("Oturumunuz süresi doldu, lütfen tekrar giriş yapın.")
        refreshSubscribers = []
        logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    } else if (
      error.response?.status === 400 ||
      error.response?.status === 500
    ) {
      // Global Toast Notification for API errors
      // Skip showing toast if trying to refresh token and it fails
      if (!originalRequest?.url?.includes("/auth/refresh-token")) {
        const message =
          (error.response.data as any)?.message ||
          "Sunucu ile iletişimde bir hata oluştu."
        toast.error(message)
      }
    }

    return Promise.reject(error)
  },
)
