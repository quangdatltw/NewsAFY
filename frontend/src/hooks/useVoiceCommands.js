"use client"

import {useCallback, useEffect, useState} from "react"
import {commandSelector} from "../services/commandSelector" // Import commandSelector
export const useVoiceCommands = ({commands, continuous = true}) => {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [recognition, setRecognition] = useState(null)

    const createRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) return null

        const newRecognition = new SpeechRecognition()
        newRecognition.continuous = continuous
        newRecognition.interimResults = false
        newRecognition.lang = "vi-VN"

        return newRecognition
    }, [continuous])

    const processCommand = useCallback(
        async (transcript) => {
            let lowerTranscript = transcript.toLowerCase().trim()
            console.log(lowerTranscript)

            // Replace specific words in the transcript
            const wordReplacements = {
                "học": "đọc",
                // Add more replacements as needed
            }
            lowerTranscript = lowerTranscript.split(" ").map(word => wordReplacements[word] || word).join(" ")
            console.log(lowerTranscript)

            try {
                const selectedCommand = await commandSelector(lowerTranscript)
                if (selectedCommand) {
                    console.log("Executing command:", selectedCommand)
                    console.log("Executing command:", commands[selectedCommand] + "()")

                    commands[selectedCommand]()
                    return true
                }
            } catch (error) {
                console.error("Error processing command:", error)
            }

            return false
        },
        [commands],
    )

    const setupRecognition = useCallback(() => {
        const rec = createRecognition()
        if (!rec) return

        rec.onstart = () => {
            setIsListening(true)
        }

        rec.onend = () => {
            if (continuous && isListening) {
                try {
                    rec.start()
                } catch (error) {
                    console.error("Failed to restart recognition:", error)
                    setIsListening(false)
                }
            } else {
                setIsListening(false)
            }
        }

        rec.onresult = (event) => {
            const current = event.results.length - 1
            const result = event.results[current][0].transcript
            setTranscript(result)
            processCommand(result)
        }

        rec.onerror = (event) => {
            console.error("Lỗi nhận dạng giọng nói", event.error)
            setIsListening(false)
        }

        setRecognition(rec)
        return rec
    }, [continuous, isListening, processCommand, createRecognition])

    const toggleListening = useCallback(() => {
        if (isListening && recognition) {
            recognition.stop()
            setIsListening(false)
        } else {
            const rec = recognition || setupRecognition()
            if (!rec) {
                alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.")
                return
            }

            try {
                rec.start()
                setIsListening(true)
            } catch (error) {
                console.error("Failed to start recognition:", error)
                // Create a new instance and try again
                const newRec = setupRecognition()
                if (newRec) {
                    try {
                        newRec.start()
                    } catch (e) {
                        alert("Không thể kích hoạt nhận dạng giọng nói.")
                    }
                }
            }
        }
    }, [recognition, isListening, setupRecognition])

    useEffect(() => {
        setupRecognition()

        return () => {
            if (recognition && isListening) {
                recognition.stop()
            }
        }
    }, [])

    return {
        isListening,
        toggleListening,
        transcript,
    }
}