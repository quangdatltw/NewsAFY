"use client"

import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"

const VoiceControls = ({ isListening, toggleListening, transcript, speaking, stopSpeaking }) => {
  return (
    <div className="voice-controls">
      <div className="controls-container">
        <button
          onClick={toggleListening}
          className={`voice-button ${isListening ? "active" : ""}`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          aria-pressed={isListening}
        >
          {isListening ? <Mic size={24} /> : <MicOff size={24} />}
          <span>{isListening ? "Listening..." : "Start Listening"}</span>
        </button>

        <button
          onClick={stopSpeaking}
          className={`voice-button ${speaking ? "active" : ""}`}
          aria-label="Stop speaking"
          disabled={!speaking}
        >
          {speaking ? <Volume2 size={24} /> : <VolumeX size={24} />}
          <span>{speaking ? "Speaking..." : "Not Speaking"}</span>
        </button>
      </div>

      {isListening && (
        <div className="transcript" aria-live="polite">
          <p>I heard: {transcript || "..."}</p>
        </div>
      )}
    </div>
  )
}

export default VoiceControls
