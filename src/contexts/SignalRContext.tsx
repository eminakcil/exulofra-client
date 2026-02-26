import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react"
import * as signalR from "@microsoft/signalr"
import { useAuthStore } from "../store/useAuthStore"
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack"

export interface TranslationSegment {
  id: string
  sourceText: string
  targetText: string
  speakerTag?: string
}

export interface PartialSegment {
  sourceText: string
  targetText: string
  speakerTag?: string
}

export interface SignalRCallbacks {
  onReceivePartial?: (partial: PartialSegment) => void
  onReceiveTranslation?: (segment: TranslationSegment) => void
  onReceiveAudio?: (segmentId: string, base64Audio: string) => void
  onSessionEnded?: () => void
}

interface SignalRContextType {
  connection: signalR.HubConnection | null
  isConnected: boolean
  error: Error | null
  setCallbacks: (cb: SignalRCallbacks) => void
  joinSession: (sessionId: string) => Promise<void>
}

const SignalRContext = createContext<SignalRContextType | null>(null)

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  )
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // We track the token so we only connect if we are logged in
  const token = useAuthStore((state) => state.token)

  const callbacksRef = useRef<SignalRCallbacks>({})

  const setCallbacks = useCallback((cb: SignalRCallbacks) => {
    callbacksRef.current = cb
  }, [])

  useEffect(() => {
    if (!token) return

    const hubUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/translation-hub`
      : "http://localhost:5164/api/translation-hub"

    console.log("Building SignalR Connection...")
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withHubProtocol(new MessagePackHubProtocol())
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build()

    newConnection.on("ReceivePartial", (partial: PartialSegment) => {
      callbacksRef.current.onReceivePartial?.(partial)
    })
    newConnection.on("ReceiveTranslation", (segment) => {
      callbacksRef.current.onReceiveTranslation?.(segment)
    })
    newConnection.on("ReceiveAudio", (segmentId, base64Audio) => {
      callbacksRef.current.onReceiveAudio?.(segmentId, base64Audio)
    })
    newConnection.on("SessionEnded", () => {
      callbacksRef.current.onSessionEnded?.()
    })

    newConnection.onreconnecting(() => setIsConnected(false))
    newConnection.onreconnected(() => setIsConnected(true))
    newConnection.onclose(() => setIsConnected(false))

    newConnection
      .start()
      .then(() => {
        console.log("SignalR Context Connected Globally")
        setConnection(newConnection)
        setIsConnected(true)
      })
      .catch((err: Error) => {
        console.error("SignalR Context Connection Error: ", err)
        setError(err)
      })

    return () => {
      console.log("Stopping SignalR Global Connection")
      newConnection.stop().then(() => setIsConnected(false))
    }
  }, [token])

  const joinSession = useCallback(
    async (sessionId: string) => {
      if (connection && isConnected) {
        await connection.invoke("JoinSession", sessionId)
        console.log("Joined SignalR Session:", sessionId)
      }
    },
    [connection, isConnected],
  )

  return (
    <SignalRContext.Provider
      value={{ connection, isConnected, error, setCallbacks, joinSession }}
    >
      {children}
    </SignalRContext.Provider>
  )
}

export const useSignalRContext = () => {
  const ctx = useContext(SignalRContext)
  if (!ctx)
    throw new Error("useSignalRContext must be used within SignalRProvider")
  return ctx
}
