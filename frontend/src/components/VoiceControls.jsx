"use client"

import {Mic, MicOff, Volume2, VolumeX} from "lucide-react"

const VoiceControls = ({isListening, toggleListening, transcript, speaking, stopSpeaking}) => {
    return (
        <div className="voice-controls">
            <div className="controls-container">
                <button
                    onClick={toggleListening}
                    className={`voice-button ${isListening ? "active" : ""}`}
                    aria-label={isListening ? "Dừng nghe" : "Bắt đầu nghe"}
                    aria-pressed={isListening}
                >
                    {isListening ? <Mic size={24}/> : <MicOff size={24}/>}
                    <span>{isListening ? "Đang lắng nghe..." : "Bắt đầu lắng nghe"}</span>
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
                <div className="transcript" aria-live="polite">
                    <p>Tôi nghe thấy: {transcript || "..."}</p>
                </div>
            )}
        </div>
    )
}

export default VoiceControls
