"use client"

import { useState, useEffect, useCallback } from "react"

export const useVoiceCommands = ({ commands, continuous = true }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  // Check if the browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  const processCommand = useCallback(
    (transcript) => {
      const lowerTranscript = transcript.toLowerCase().trim()

      // Check for exact matches first
      if (commands[lowerTranscript]) {
        commands[lowerTranscript]()
        return true
      }

      // Check for wildcard commands
      for (const command in commands) {
        if (command.includes("*")) {
          const parts = command.split("*")
          const prefix = parts[0].trim().toLowerCase()

          if (lowerTranscript.startsWith(prefix)) {
            const parameter = lowerTranscript.substring(prefix.length).trim()
            commands[command](parameter)
            return true
          }
        }
      }

      return false
    },
    [commands],
  )

  const setupRecognition = useCallback(() => {
    if (!recognition) return

    recognition.continuous = continuous
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      if (continuous && isListening) {
        recognition.start()
      } else {
        setIsListening(false)
      }
    }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const result = event.results[current][0].transcript
      setTranscript(result)
      processCommand(result)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }
  }, [recognition, continuous, isListening, processCommand])

  const toggleListening = useCallback(() => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }, [recognition, isListening])

  useEffect(() => {
    setupRecognition()

    return () => {
      if (recognition && isListening) {
        recognition.stop()
      }
    }
  }, [setupRecognition, recognition, isListening])

  return {
    isListening,
    toggleListening,
    transcript,
  }
}
