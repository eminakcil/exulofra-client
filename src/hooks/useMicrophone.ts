import { useState, useCallback, useRef, useEffect } from "react"

interface UseMicrophoneOptions {
  onAudioData: (data: Int16Array) => void
  isSystemAudio?: boolean // If true, uses getDisplayMedia for Broadcast mode
  sampleRate?: number // Expected by Azure (usually 16000 or 44100)
}

export const useMicrophone = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)

  const startRecording = useCallback(
    async ({
      onAudioData,
      isSystemAudio = false,
      sampleRate = 16000,
    }: UseMicrophoneOptions) => {
      try {
        setError(null)

        // 1. Request User Media
        let stream: MediaStream
        if (isSystemAudio) {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true, // often required to be true by browsers to capture desktop
            audio: true, // This is what we actually want
          })
          const audioTracks = displayStream.getAudioTracks()
          if (audioTracks.length === 0) {
            throw new Error(
              "Sistem sesi paylaşılamadı. Lütfen 'Sistemi Sesini Paylaş' seçeneğini işaretlediğinizden emin olun.",
            )
          }
          stream = new MediaStream([audioTracks[0]])

          displayStream.getVideoTracks().forEach((track) => track.stop())
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          })
        }

        mediaStreamRef.current = stream

        // 2. Setup Audio Context with target Sample Rate
        const audioContext = new window.AudioContext({ sampleRate })
        audioContextRef.current = audioContext

        // 3. Load AudioWorklet from public folder
        await audioContext.audioWorklet.addModule("/audio-processor.js")

        // 4. Create Nodes
        const source = audioContext.createMediaStreamSource(stream)
        sourceNodeRef.current = source

        const workletNode = new AudioWorkletNode(
          audioContext,
          "pcm-audio-processor",
        )
        workletNodeRef.current = workletNode

        // 5. Handle messages (PCM chunks) from Worklet
        workletNode.port.onmessage = (event) => {
          onAudioData(event.data)
        }

        // 6. Connect graph: Source -> Worklet -> Destination
        source.connect(workletNode)
        workletNode.connect(audioContext.destination)

        setIsRecording(true)
      } catch (err: any) {
        console.error("Microphone Access Error:", err)
        if (err.name === "NotAllowedError") {
          setError("Mikrofon erişimi reddedildi.")
        } else if (err.name === "NotFoundError") {
          setError("Kullanılabilir mikrofon bulunamadı.")
        } else {
          setError(err.message || "Ses kaydı başlatılırken bir hata oluştu.")
        }
        setIsRecording(false)
        throw err
      }
    },
    [],
  )

  const stopRecording = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect()
      workletNodeRef.current = null
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    setIsRecording(false)
  }, [])

  // Ensure microphone hardware is released if the component unmounts unexpectedly
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  return { isRecording, error, startRecording, stopRecording }
}
