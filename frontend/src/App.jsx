"use client"

import { useState, useEffect } from "react"
import NewsCard from "./components/NewsCard"
import VoiceControls from "./components/VoiceControls"
import CategorySelector from "./components/CategorySelector"
import { fetchNews } from "./services/newsService"
import { useVoiceCommands } from "./hooks/useVoiceCommands"
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis"
import "./App.css"

function App() {
  const [articles, setArticles] = useState([])
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
  const [category, setCategory] = useState("general")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const { speak, stop, speaking } = useSpeechSynthesis()

  const { isListening, toggleListening, transcript } = useVoiceCommands({
    commands: {
      read: () => readCurrentArticle(),
      next: () => navigateArticle(1),
      previous: () => navigateArticle(-1),
      stop: () => stop(),
      "category *": (categoryName) => changeCategory(categoryName),
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
      speak(`Loaded ${data.length} articles in category ${category}. Say "read" to hear the first article.`)
    } catch (err) {
      setError("Failed to load news. Please try again later.")
      speak("Failed to load news. Please try again later.")
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
      speak(`Article ${newIndex + 1} of ${articles.length}. Say "read" to hear it.`)
    } else {
      speak(newIndex < 0 ? "You're at the first article" : "You're at the last article")
    }
  }

  const changeCategory = (newCategory) => {
    stop()
    setCategory(newCategory)
    speak(`Changing to ${newCategory} category`)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Voice News Reader</h1>
        <p className="accessibility-info">
          Control with voice commands: "read", "next", "previous", "stop", "category [name]"
        </p>
      </header>

      <VoiceControls
        isListening={isListening}
        toggleListening={toggleListening}
        transcript={transcript}
        speaking={speaking}
        stopSpeaking={stop}
      />

      <CategorySelector currentCategory={category} onSelectCategory={changeCategory} />

      <main className="news-container">
        {isLoading ? (
          <div className="loading" aria-live="polite">
            Loading news...
          </div>
        ) : error ? (
          <div className="error" aria-live="assertive">
            {error}
          </div>
        ) : articles.length === 0 ? (
          <div className="no-articles" aria-live="polite">
            No articles found. Try another category.
          </div>
        ) : (
          <>
            <div className="navigation-info" aria-live="polite">
              Article {currentArticleIndex + 1} of {articles.length}
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
