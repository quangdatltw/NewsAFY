"use client"

import { useState, useEffect, useCallback } from "react"

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState([])
  const [currentVoice, setCurrentVoice] = useState(null)
  const [speaking, setSpeaking] = useState(false)

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)

        // Set a default English voice if available
        const englishVoice =
          availableVoices.find((voice) => voice.lang.includes("en-") && voice.localService) || availableVoices[0]

        setCurrentVoice(englishVoice)
      }
    }

    loadVoices()

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Handle speaking state changes
  useEffect(() => {
    const handleSpeakingEnd = () => {
      setSpeaking(false)
    }

    window.speechSynthesis.addEventListener("end", handleSpeakingEnd)

    return () => {
      window.speechSynthesis.removeEventListener("end", handleSpeakingEnd)
    }
  }, [])

  // Speak function
  const speak = useCallback(
    (text) => {
      // Cancel any ongoing speech
      stop()

      if (!text) return

      const utterance = new SpeechSynthesisUtterance(text)

      if (currentVoice) {
        utterance.voice = currentVoice
      }

      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [currentVoice],
  )

  // Stop function
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  // Set voice function
  const setVoice = useCallback((voice) => {
    setCurrentVoice(voice)
  }, [])

  return {
    speak,
    stop,
    speaking,
    voices,
    setVoice,
    currentVoice,
  }
}
