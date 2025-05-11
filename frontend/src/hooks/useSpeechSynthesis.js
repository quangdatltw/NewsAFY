"use client"

import {useCallback, useEffect, useRef, useState} from "react"

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([])
    const [currentVoice, setCurrentVoice] = useState(null)
    const [speaking, setSpeaking] = useState(false)
    const [availableVoicesLoaded, setAvailableVoicesLoaded] = useState(false)
    const utteranceRef = useRef(null)

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()

            if (availableVoices.length > 0) {
                setVoices(availableVoices)
                setAvailableVoicesLoaded(true)

                // Tìm giọng tiếng Việt theo thứ tự ưu tiên
                const vietnameseVoice =
                    // 1. Ưu tiên giọng tiếng Việt local
                    availableVoices.find((voice) => voice.lang.includes("vi-") && voice.localService) ||
                    // 2. Bất kỳ giọng tiếng Việt nào
                    availableVoices.find((voice) => voice.lang.includes("vi-")) ||
                    // 3. Giọng tiếng Việt theo tên (một số giọng có thể có "Vietnamese" trong tên)
                    availableVoices.find((voice) => voice.name.includes("Vietnam")) ||
                    // 4. Fallback: giọng đầu tiên
                    availableVoices[0]

                if (vietnameseVoice) {
                    console.log("Đã chọn giọng:", vietnameseVoice.name, vietnameseVoice.lang)
                    setCurrentVoice(vietnameseVoice)
                } else {
                    console.log("Không tìm thấy giọng tiếng Việt, sử dụng giọng mặc định")
                }
            }
        }

        loadVoices()

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    // Stop function
    const stop = useCallback(() => {
        window.speechSynthesis.cancel()
        setSpeaking(false)
    }, [])

    // Speak function
    const speak = useCallback(
        (text) => {
            // Always cancel any ongoing speech first
            stop()

            if (!text) return

            // Add a small delay before starting new speech
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text)

                if (currentVoice) {
                    utterance.voice = currentVoice
                    utterance.lang = currentVoice.lang // Sử dụng ngôn ngữ của giọng đã chọn
                } else {
                    utterance.lang = "vi-VN" // Fallback to Vietnamese
                }

                utterance.rate = 1.0
                utterance.pitch = 1.0
                utterance.volume = 1.0

                // Store reference to current utterance
                utteranceRef.current = utterance

                utterance.onstart = () => setSpeaking(true)
                utterance.onend = () => setSpeaking(false)
                utterance.onerror = (e) => {
                    if (e.error === "interrupted") {
                        console.log("Speech was interrupted, likely by another speech request")
                    } else {
                        console.error("Lỗi phát âm:", e)
                    }
                    setSpeaking(false)
                }

                // Handle potential browser issues with speech synthesis
                try {
                    window.speechSynthesis.speak(utterance)
                    
                    if (utterance.text.length > 100) {
                        const intervalId = setInterval(() => {
                            if (!window.speechSynthesis.speaking) {
                                clearInterval(intervalId)
                                return
                            }
                            // Firefox fix - pause and resume keeps the speech synthesis alive
                            window.speechSynthesis.pause()
                            window.speechSynthesis.resume()
                        }, 5000)

                        // Store the original onend handler
                        const originalOnEnd = utterance.onend

                        // Create a new onend handler that calls the original one and clears the interval
                        utterance.onend = (event) => {
                            clearInterval(intervalId)
                            setSpeaking(false)
                            if (originalOnEnd) originalOnEnd(event)
                        }
                    }
                } catch (err) {
                    console.error("Failed to start speech synthesis:", err)
                    setSpeaking(false)
                }
            }, 400)
        },
        [currentVoice, stop],
    )

    // Set voice function
    const setVoice = useCallback((voice) => {
        console.log("Đã thay đổi giọng thành:", voice.name, voice.lang)
        setCurrentVoice(voice)
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    return {
        speak,
        stop,
        speaking,
        voices,
        setVoice,
        currentVoice,
        availableVoicesLoaded,
    }
}