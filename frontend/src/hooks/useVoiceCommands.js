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
            let lowerTranscript = transcript.toLowerCase().trim();
            console.log("Original transcript:", lowerTranscript);

            // Filter out "phẩy", "phay", and other short utterances
            if (
                // Common false positives that start with "ph" and are short
                /^ph[aàáạãảăằắặẵẳâầấậẫẩ][yỳýỵỹỷ][.]$/i.test(lowerTranscript) ||
                // Very short transcripts (less than 2 characters)
                lowerTranscript.length < 3 ||
                // Common single words that should be ignored
                ['phẩy.', 'phay', 'phải', 'phải không', 'phế', 'phá',"ừ."].includes(lowerTranscript)
            ) {
                console.log("Ignoring common false positive:", lowerTranscript);
                return false;
            }

            try {
                const commandResult = await commandSelector(lowerTranscript);
                console.log("Command selector returned:", commandResult);

                // Check if it's a category command (format: "5:categoryName")
                if (commandResult.includes(':')) {
                    const [cmd, param] = commandResult.split(':');
                    if (cmd === "5" && commands[cmd]) {
                        console.log(`Executing category command with param: ${param}`);
                        commands[cmd](param);
                        return true;
                    }
                }
                // Regular command
                else if (commands[commandResult]) {
                    console.log(`Executing command: ${commandResult}`);
                    commands[commandResult]();
                    return true;
                }

                console.warn("No matching command found for:", commandResult);
            } catch (error) {
                console.error("Error processing command:", error);
            }

            return false;
        },
        [commands]
    );

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
            // Clear transcript when stopping listening
            setTranscript("")
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
