import { useEffect, useRef, useCallback } from "react"
import * as signalR from "@microsoft/signalr"
import {
  useSignalRContext,
  type TranslationSegment,
  type SignalRCallbacks,
  type PartialSegment,
} from "../contexts/SignalRContext"

export type { TranslationSegment, PartialSegment }

interface UseSignalROptions extends SignalRCallbacks {
  hubUrl?: string // Deprecated, now managed by SignalRContext
  translationId: string | null
}

export function useSignalR({
  translationId,
  onReceivePartial,
  onReceiveTranslation,
  onReceiveAudio,
  onSessionEnded,
}: UseSignalROptions) {
  const { connection, isConnected, error, setCallbacks, joinSession } =
    useSignalRContext()

  const audioStreamSubjectRef = useRef<signalR.Subject<Uint8Array> | null>(null)

  // Register callbacks on mount and update when they change
  useEffect(() => {
    setCallbacks({
      onReceivePartial,
      onReceiveTranslation,
      onReceiveAudio,
      onSessionEnded,
    })

    // Cleanup callbacks on unmount so they don't fire when we leave the page
    return () => {
      setCallbacks({})
    }
  }, [
    onReceivePartial,
    onReceiveTranslation,
    onReceiveAudio,
    onSessionEnded,
    setCallbacks,
  ])

  // Join session when translation ID becomes available
  // (Effectively letting the backend know this client wants updates for this specific translation)
  useEffect(() => {
    if (isConnected && translationId) {
      joinSession(translationId).catch(console.error)
    }
  }, [isConnected, translationId, joinSession])

  // Function to initialize the upload stream to the server
  const startAudioStream = useCallback(async () => {
    if (!connection || !translationId || !isConnected) {
      throw new Error("Cannot start stream: SignalR not connected")
    }

    // Create a new Subject
    const subject = new signalR.Subject<Uint8Array>()
    audioStreamSubjectRef.current = subject

    try {
      // Assuming backend expects a stream parameter
      await connection.send("StartStream", translationId, subject)
    } catch (err) {
      console.error("Error starting audio stream", err)
      subject.complete()
      audioStreamSubjectRef.current = null
    }
  }, [translationId, isConnected, connection])

  // Function to push chunks into the running stream
  const sendAudioChunk = useCallback((pcmChunk: Int16Array) => {
    if (audioStreamSubjectRef.current) {
      // SignalR with MessagePack usually handles Uint8Array cleanly representing byte arrays
      const bytes = new Uint8Array(
        pcmChunk.buffer,
        pcmChunk.byteOffset,
        pcmChunk.byteLength,
      )
      audioStreamSubjectRef.current.next(bytes)
    }
  }, [])

  // Function to stop the stream
  const stopAudioStream = useCallback(() => {
    if (audioStreamSubjectRef.current) {
      audioStreamSubjectRef.current.complete()
      audioStreamSubjectRef.current = null
    }
  }, [])

  // Cleanup active streams on unmount
  useEffect(() => {
    return () => {
      stopAudioStream()
    }
  }, [stopAudioStream])

  return {
    connection,
    isConnected,
    error,
    startAudioStream,
    sendAudioChunk,
    stopAudioStream,
  }
}
