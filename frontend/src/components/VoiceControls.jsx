"use client"

import {Mic, MicOff, Volume2, VolumeX} from "lucide-react"
import {useCallback, useState} from "react"

const VoiceControls = ({isListening, toggleListening, transcript, speaking, stopSpeaking}) => {
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handleToggleListening = useCallback(() => {
        if (isButtonDisabled) return;

        // Disable the button
        setIsButtonDisabled(true);

        // Call the actual handler
        toggleListening();

        // Re-enable after 2 seconds
        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 1000);
    }, [toggleListening, isButtonDisabled]);

    return (
        <div className="voice-controls">
            <div className="controls-container">
                <button
                    onClick={handleToggleListening}
                    className={`voice-button ${isListening ? "active" : ""} ${isButtonDisabled ? "disabled" : ""}`}
                    aria-label={isListening ? "Dừng nghe" : "Bắt đầu nghe"}
                    aria-pressed={isListening}
                    disabled={isButtonDisabled}
                >
                    {isListening ? <Mic size={24}/> : <MicOff size={24}/>}
                    <span>{isButtonDisabled ? "Vui lòng đợi..." : isListening ? "Đang lắng nghe..." : "Bắt đầu lắng nghe"}</span>
                </button>

                <button
                    onClick={stopSpeaking}
                    className={`voice-button ${speaking ? "active" : ""}`}
                    aria-label="Dừng nói"
                    disabled={!speaking}
                >
                    {speaking ? <Volume2 size={24}/> : <VolumeX size={24}/>}
                    <span>{speaking ? "Đang nói..." : "Không nói"}</span>
                </button>
            </div>

            {isListening && (
                <div className="transcript">
                    <p>Tôi nghe thấy: {transcript || "..."}</p>
                </div>
            )}
        </div>
    )
}

export default VoiceControls