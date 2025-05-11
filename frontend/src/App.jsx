// App.jsx updates
import {useEffect, useRef, useState} from "react"
import NewsCard from "./components/NewsCard"
import VoiceControls from "./components/VoiceControls"
import CategorySelector from "./components/CategorySelector"
import VoiceSelector from "./components/VoiceSelector.jsx"
import {fetchNews} from "./services/newsService"
import {useVoiceCommands} from "./hooks/useVoiceCommands"
import {useSpeechSynthesis} from "./hooks/useSpeechSynthesis"
import "./App.css"

function App() {
    const [allArticles, setAllArticles] = useState([])
    const [articles, setArticles] = useState([])
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
    const [category, setCategory] = useState("general")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [categoryData, setCategoryData] = useState({})
    const [selectedArticleText, setSelectedArticleText] = useState("");
    const isInitialLoad = useRef(true)
    const isLoadingRef = useRef(false)
    const categoryNameInVietnamese = {
        "general": "tổng hợp",
        "politics": "chính trị",
        "business": "kinh doanh",
        "technology": "công nghệ",
        "entertainment": "giải trí",
        "sports": "thể thao",
        "health": "sức khỏe",
        "science": "khoa học",
        // Add other categories as needed
    };

    const {speak, stop, speaking, voices, currentVoice, setVoice} = useSpeechSynthesis()

    const {isListening, toggleListening, transcript} = useVoiceCommands({
        commands: {
            "đọc tin tức": () => readCurrentArticle(),
            "tin tiếp theo": () => navigateArticle(1),
            "tin trước đó": () => navigateArticle(-1),
            "dừng đọc": () => stop(),
            "chuyên mục *": (categoryName) => changeCategory(categoryName),
        },
    })

    // Load all news data once when the component mounts
    useEffect(() => {
        loadNews()
    }, [])

    // Filter articles whenever category changes
    useEffect(() => {
        filterArticlesByCategory(category)
    }, [category, allArticles])

    const loadNews = async () => {
        // Prevent concurrent requests
        if (isLoadingRef.current) return

        try {
            isLoadingRef.current = true
            setIsLoading(true)
            setError(null)

            // Fetch all news articles once
            const data = await fetchNews()
            setCategoryData(data.categoryData)
            setAllArticles(data.articles)

            // Initial filtering will happen in the category effect
        } catch (err) {
            setError("Không thể tải tin tức. Vui lòng thử lại sau.")
            speak("Không thể tải tin tức. Vui lòng thử lại sau.")
        } finally {
            setIsLoading(false)
            isLoadingRef.current = false
        }
    }

    const filterArticlesByCategory = (currentCategory) => {
        if (allArticles.length === 0) return;

        // Filter articles by selected category
        const filteredArticles = currentCategory === "general"
            ? allArticles
            : allArticles.filter(article => article.category === currentCategory)

        setArticles(filteredArticles)
        setCurrentArticleIndex(0)

        // Only announce on first load or category change
        if (isInitialLoad.current && filteredArticles.length > 0) {
            isInitialLoad.current = false
            speak(`Đã tải ${filteredArticles.length} bài báo. Nói đọc để nghe bài đầu tiên.`)
        } else if (filteredArticles.length > 0) {
            const vietnameseName = categoryNameInVietnamese[currentCategory] || currentCategory
            speak(`Đã tải ${filteredArticles.length} bài báo trong chuyên mục ${vietnameseName}.`)
        }
    }

    // Create a new handler function at the top of your App component
    const handleReadArticle = (index) => {
        setCurrentArticleIndex(index);
        // Use a small timeout to ensure state is updated before reading
        setTimeout(() => {
            // Get the article at the specified index directly
            const articleToRead = articles[index];

            // Format date information
            let dateInfo = "";
            if (articleToRead.metadata && articleToRead.metadata.date) {
                const dateParts = articleToRead.metadata.date.split(", ");
                if (dateParts.length >= 2) {
                    const dayOfWeek = dateParts[0];
                    const dateAndTime = dateParts[1].split(" ");
                    if (dateAndTime.length >= 1) {
                        const time = dateParts[2]?.split(" ")[0] || "";
                        const dateWithoutYear = dateAndTime[0].split("/").slice(0, 2).join("tháng");
                        dateInfo = `. bài viết lúc ${time} ${dayOfWeek}, ${dateWithoutYear}`;
                    }
                }
            }

            // Get content and read it
            const articleContent = articleToRead.textContent;
            const textToRead = `${articleToRead.title}${dateInfo}. Tác giả ${articleToRead.metadata.author}. ${articleToRead.description || ""}. ${articleContent}`;

            // Set the selected article text for display
            setSelectedArticleText(articleContent || "Không có nội dung chi tiết.");

            // Read the article
            speak(textToRead);
        }, 50);
    };

    // Update the readCurrentArticle function to set the selected article text
    const readCurrentArticle = () => {
        if (articles.length === 0) return

        const article = articles[currentArticleIndex]

        // Format date information if available
        let dateInfo = "";
        if (article.metadata && article.metadata.date) {
            // Transform date format
            const dateParts = article.metadata.date.split(", ");
            if (dateParts.length >= 2) {
                const dayOfWeek = dateParts[0]; // e.g., "Thứ bảy"
                const dateAndTime = dateParts[1].split(" "); // e.g., ["10/5/2025", "21:00"]

                if (dateAndTime.length >= 1) {
                    const time = dateParts[2]?.split(" ")[0] || ""; // e.g., "21:00"
                    // Extract date without year
                    const dateWithoutYear = dateAndTime[0].split("/").slice(0, 2).join("tháng");
                    dateInfo = `. bài viết lúc ${time} ${dayOfWeek}, ${dateWithoutYear}`;
                }
            }
        }

        // Get the full article content or fall back to description
        const articleContent = article.textContent;
        console.log(article);

        // Combine title, date info, description and content for reading
        const textToRead = `${article.title}${dateInfo}. Tác giả ${article.metadata.author}. ${article.description || ""}. ${articleContent}`

        // Set the selected article text for display in the side panel
        setSelectedArticleText(articleContent || "Không có nội dung chi tiết.")

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
        const vietnameseName = categoryNameInVietnamese[newCategory] || newCategory
        speak(`Đang chuyển sang chuyên mục ${vietnameseName}`)
    }

   return (
        <div className="app-layout">
            <div className="app-container">
                <header className="app-header">
                    <h1>Ứng Dụng Đọc Tin Tức</h1>
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
                {voices && voices.length > 0 &&
                    <VoiceSelector
                        voices={voices}
                        currentVoice={currentVoice}
                        onVoiceChange={setVoice}
                    />
                }

                <CategorySelector
                    currentCategory={category}
                    onSelectCategory={changeCategory}
                    categoryData={categoryData}
                />

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
                                        onRead={() => handleReadArticle(index)}
                                    />
                                ))}

                                {/* Mobile article panel */}
                                {selectedArticleText && (
                                    <div className="article-panel mobile-article-panel">
                                        <h3>Nội dung bài báo</h3>
                                        <div className="article-content">
                                            {selectedArticleText}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Desktop article panel */}
            {selectedArticleText && (
                <div className="article-panel desktop-article-panel">
                    <h3>Nội dung bài báo</h3>
                    <div className="article-content">
                        {selectedArticleText}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App