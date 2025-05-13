"use client"

import {useCallback, useEffect, useRef, useState} from "react"

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([])
    const [currentVoice, setCurrentVoice] = useState(null)
    const [speaking, setSpeaking] = useState(false)
    const [availableVoicesLoaded, setAvailableVoicesLoaded] = useState(false)
    const utteranceRef = useRef(null)
    const [isWelcomeSpeaking, setIsWelcomeSpeaking] = useState(false);
    const synth = window.speechSynthesis;

    // Load available voices
    useEffect(() => {
        // First cancel any speech from previous session
        const wasSpeaking = sessionStorage.getItem('isSpeaking') === 'true';
        if (wasSpeaking) {
            window.speechSynthesis.cancel();
            sessionStorage.removeItem('isSpeaking');
        }

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
        sessionStorage.removeItem('isSpeaking')
    }, [])



    const speak = useCallback((text, callback = null, isWelcomeMessage = false) => {
        // Don't interrupt welcome message
        if (isWelcomeSpeaking && !isWelcomeMessage) {
            return; // Simply return without speaking
        }

        // Cancel current speech if not in welcome message
        if (!isWelcomeSpeaking || isWelcomeMessage) {
            synth.cancel();
        }

        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice properties
        if (currentVoice) {
            utterance.voice = currentVoice;
            utterance.lang = currentVoice.lang;
        } else {
            utterance.lang = "vi-VN";
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utteranceRef.current = utterance;

        // Set welcome flag if this is welcome message
        if (isWelcomeMessage) {
            setIsWelcomeSpeaking(true);
        }

        utterance.onstart = () => {
            setSpeaking(true);
            sessionStorage.setItem('isSpeaking', 'true');
        };

        utterance.onend = () => {
            setSpeaking(false);
            sessionStorage.removeItem('isSpeaking');

            // Reset welcome flag when welcome message ends
            if (isWelcomeMessage) {
                setIsWelcomeSpeaking(false);
            }

            // Call callback if provided
            if (callback && typeof callback === 'function') {
                callback();
            }
        };

        utterance.onerror = () => {
            setSpeaking(false);
            sessionStorage.removeItem('isSpeaking');

            if (isWelcomeMessage) {
                setIsWelcomeSpeaking(false);
            }

            if (callback && typeof callback === 'function') {
                callback();
            }
        };

        synth.speak(utterance);
    }, [currentVoice, isWelcomeSpeaking]);


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
                sessionStorage.removeItem('isSpeaking')
            }
        }
    }, [])

    // Handle page visibility change (when switching tabs)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // User is leaving the page
                if (speaking) {
                    sessionStorage.setItem('isSpeaking', 'true')
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Add beforeunload event handler
        const handleBeforeUnload = () => {
            if (speaking) {
                sessionStorage.setItem('isSpeaking', 'true')
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [speaking])

    return {
        speak,
        stop,
        speaking,
        voices,
        setVoice,
        currentVoice,
        availableVoicesLoaded,
        isWelcomeSpeaking
    };
}