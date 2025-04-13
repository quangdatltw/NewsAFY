"use client"

import {useEffect, useState} from "react"
import NewsCard from "./components/NewsCard"
import VoiceControls from "./components/VoiceControls"
import CategorySelector from "./components/CategorySelector"
import VoiceSelector from "./components/VoiceSelector.jsx"
import {fetchNews} from "./services/newsService"
import {useVoiceCommands} from "./hooks/useVoiceCommands"
import {useSpeechSynthesis} from "./hooks/useSpeechSynthesis"
import "./App.css"

function App() {
    const [articles, setArticles] = useState([])
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
    const [category, setCategory] = useState("general")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const {speak, stop, speaking, voices, currentVoice, setVoice} = useSpeechSynthesis()

    const {isListening, toggleListening, transcript} = useVoiceCommands({
        commands: {
            đọc: () => readCurrentArticle(),
            "tiếp theo": () => navigateArticle(1),
            "trước đó": () => navigateArticle(-1),
            "dừng lại": () => stop(),
            "chuyên mục *": (categoryName) => changeCategory(categoryName),
        },
    })

    useEffect(() => {
        loadNews()
    }, [category])

    const loadNews = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await fetchNews(category)
            setArticles(data)
            setCurrentArticleIndex(0)

            // Announce that news has been loaded
            speak(`Đã tải ${data.length} bài báo trong chuyên mục ${category}. Nói "đọc" để nghe bài đầu tiên.`)
        } catch (err) {
            setError("Không thể tải tin tức. Vui lòng thử lại sau.")
            speak("Không thể tải tin tức. Vui lòng thử lại sau.")
        } finally {
            setIsLoading(false)
        }
    }

    const readCurrentArticle = () => {
        if (articles.length === 0) return

        const article = articles[currentArticleIndex]
        const textToRead = `${article.title}. ${article.description || ""}`
        speak(textToRead)
    }

    const navigateArticle = (direction) => {
        stop()
        const newIndex = currentArticleIndex + direction
        if (newIndex >= 0 && newIndex < articles.length) {
            setCurrentArticleIndex(newIndex)
            speak(`Bài báo ${newIndex + 1} trong số ${articles.length}. Nói "đọc" để nghe nội dung.`)
        } else {
            speak(newIndex < 0 ? "Bạn đang ở bài đầu tiên" : "Bạn đang ở bài cuối cùng")
        }
    }

    const changeCategory = (newCategory) => {
        stop()
        setCategory(newCategory)
        speak(`Đang chuyển sang chuyên mục ${newCategory}`)
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Ứng Dụng Đọc Tin Tức Bằng Giọng Nói</h1>
                <p className="accessibility-info">
                    Điều khiển bằng lệnh thoại: "đọc", "tiếp theo", "trước đó", "dừng lại", "chuyên mục [tên]"
                </p>
            </header>

            <VoiceControls
                isListening={isListening}
                toggleListening={toggleListening}
                transcript={transcript}
                speaking={speaking}
                stopSpeaking={stop}
            />
            {voices.length > 0 && <VoiceSelector voices={voices} currentVoice={currentVoice} onVoiceChange={setVoice}/>}

            <CategorySelector currentCategory={category} onSelectCategory={changeCategory}/>

            <main className="news-container">
                {isLoading ? (
                    <div className="loading" aria-live="polite">
                        Đang tải tin tức...
                    </div>
                ) : error ? (
                    <div className="error" aria-live="assertive">
                        {error}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="no-articles" aria-live="polite">
                        Không tìm thấy bài báo nào. Hãy thử chuyên mục khác.
                    </div>
                ) : (
                    <>
                        <div className="navigation-info" aria-live="polite">
                            Bài báo {currentArticleIndex + 1} trong số {articles.length}
                        </div>
                        <div className="articles-list">
                            {articles.map((article, index) => (
                                <NewsCard
                                    key={index}
                                    article={article}
                                    isActive={index === currentArticleIndex}
                                    onRead={() => {
                                        setCurrentArticleIndex(index)
                                        readCurrentArticle()
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default App
