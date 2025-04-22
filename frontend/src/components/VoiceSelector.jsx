"use client"

const VoiceSelector = ({voices, currentVoice, onVoiceChange}) => {
    // Lọc chỉ giữ giọng nói tiếng Việt và tiếng Anh
    const filteredVoices = voices.filter(voice => {
        const langCode = voice.lang.split("-")[0]; // Lấy mã ngôn ngữ chính (vi, en)
        return langCode === "vi" || langCode === "en";
    });

    // Nhóm giọng nói theo ngôn ngữ
    const groupedVoices = filteredVoices.reduce((groups, voice) => {
        const lang = voice.lang.split("-")[0];
        if (!groups[lang]) {
            groups[lang] = [];
        }
        groups[lang].push(voice);
        return groups
    }, {});

    // Sắp xếp các nhóm ngôn ngữ, đưa tiếng Việt lên đầu
    const sortedLanguages = Object.keys(groupedVoices).sort((a, b) => {
        if (a === "vi") return -1
        if (b === "vi") return 1
        return a.localeCompare(b)
    })

    return (
        <div className="voice-selector">
            <h3>Chọn giọng đọc</h3>
            <select
                value={currentVoice ? currentVoice.name : ""}
                onChange={(e) => {
                    const selectedVoice = voices.find((voice) => voice.name === e.target.value)
                    if (selectedVoice) {
                        onVoiceChange(selectedVoice)
                    }
                }}
                className="voice-select"
            >
                {sortedLanguages.map((lang) => (
                    <optgroup key={lang} label={getLanguageName(lang)}>
                        {groupedVoices[lang].map((voice) => (
                            <option key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    )
}

// Hàm trợ giúp để hiển thị tên ngôn ngữ đầy đủ
function getLanguageName(langCode) {
    const languages = {
        vi: "Tiếng Việt",
        en: "Tiếng Anh",
    }

    return languages[langCode] || `Ngôn ngữ (${langCode})`
}

export default VoiceSelector
