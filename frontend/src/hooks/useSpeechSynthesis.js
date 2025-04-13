"use client"

import {useCallback, useEffect, useState} from "react"

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([])
    const [currentVoice, setCurrentVoice] = useState(null)
    const [speaking, setSpeaking] = useState(false)
    const [availableVoicesLoaded, setAvailableVoicesLoaded] = useState(false)

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()

            if (availableVoices.length > 0) {
                setVoices(availableVoices)
                setAvailableVoicesLoaded(true)

                console.log(
                    "Tất cả các giọng có sẵn:",
                    availableVoices.map((v) => `${v.name} (${v.lang})`),
                )

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
                utterance.lang = currentVoice.lang // Sử dụng ngôn ngữ của giọng đã chọn
            } else {
                utterance.lang = "vi-VN" // Fallback to Vietnamese
            }

            utterance.rate = 1.0
            utterance.pitch = 1.0
            utterance.volume = 1.0

            utterance.onstart = () => setSpeaking(true)
            utterance.onend = () => setSpeaking(false)
            utterance.onerror = (e) => {
                console.error("Lỗi phát âm:", e)
                setSpeaking(false)
            }

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
        console.log("Đã thay đổi giọng thành:", voice.name, voice.lang)
        setCurrentVoice(voice)
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
