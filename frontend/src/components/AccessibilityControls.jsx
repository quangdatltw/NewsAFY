import {Eye, Moon, Sun} from "lucide-react"

const AccessibilityControls = ({
                                   fontSize,
                                   onIncreaseFontSize,
                                   onDecreaseFontSize,
                                   contrastMode,
                                   toggleContrastMode,
                                   darkMode,
                                   toggleDarkMode
                               }) => {
    return (
        <div className="accessibility-controls">
            <h3>Tùy chỉnh hiển thị</h3>
            <div className="controls-group">
                <button
                    onClick={onDecreaseFontSize}
                    aria-label="Giảm cỡ chữ"
                    className="control-button"
                >
                    A-
                </button>
                <span className="font-size-value">{fontSize}%</span>
                <button
                    onClick={onIncreaseFontSize}
                    aria-label="Tăng cỡ chữ"
                    className="control-button"
                >
                    A+
                </button>
            </div>
            <div className="controls-group">
                <button
                    onClick={toggleContrastMode}
                    aria-pressed={contrastMode}
                    className={`control-button ${contrastMode ? 'active' : ''}`}
                    aria-label={contrastMode ? "Tắt tương phản cao" : "Bật tương phản cao"}
                >
                    <Eye size={32}/>
                    <span>{contrastMode ? "  Tương phản thường" : "  Tương phản cao"}</span>
                </button>
                <button
                    onClick={toggleDarkMode}
                    aria-pressed={darkMode}
                    className={`control-button ${darkMode ? 'active' : ''}`}
                    aria-label={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                >
                    {darkMode ? <Sun size={32}/> : <Moon size={32}/>}
                    <span>{darkMode ? "         Chế độ sáng" : "       Chế độ tối"}</span>

                </button>
            </div>
        </div>
    );
};

export default AccessibilityControls;