// App.jsx updates
import {useEffect, useRef, useState} from "react"
import NewsCard from "./components/NewsCard"
import VoiceControls from "./components/VoiceControls"
import CategorySelector from "./components/CategorySelector"
import {fetchNews} from "./services/newsService"
import {useVoiceCommands} from "./hooks/useVoiceCommands"
import {useSpeechSynthesis} from "./hooks/useSpeechSynthesis"
import AccessibilityControls from "./components/AccessibilityControls.jsx";
import {analyzeGoldPriceData, analyzeWeatherData} from "./services/analyzeApiService";
import "./App.css"
import {fetchWeatherData} from "@/services/weatherService.js";
import {fetchGoldPrice} from "@/services/goldPriceService.js";
import WeatherDisplay from "@/components/WeatherDisplay.jsx";


function App() {
    const [allArticles, setAllArticles] = useState([])
    const [articles, setArticles] = useState([])
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
    const [category, setCategory] = useState("general")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [categoryData, setCategoryData] = useState({})
    const [selectedArticleText, setSelectedArticleText] = useState("");
    const [fontSize, setFontSize] = useState(110);
    const [contrastMode, setContrastMode] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isWelcomeComplete, setIsWelcomeComplete] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [goldPriceData, setGoldPriceData] = useState(null);

    const increaseFontSize = () => {
        if (fontSize < 200) {
            setFontSize(prevSize => prevSize + 10);
        }
    };

    const decreaseFontSize = () => {
        if (fontSize > 80) {
            setFontSize(prevSize => prevSize - 10);
        }
    };

    const toggleContrastMode = () => {
        setContrastMode(prev => !prev);
    };

    // Fix the toggle functions
    const toggleDarkMode = () => {
        if (darkMode) {
            setDarkMode(false);
            localStorage.setItem('accessibility', JSON.stringify({
                fontSize,
                contrastMode,
                darkMode: false
            }));
            return;
        }
        setDarkMode(true);
        localStorage.setItem('accessibility', JSON.stringify({
            fontSize,
            contrastMode,
            darkMode: true
        }));
    };

    const toggleLightMode = () => {
        setDarkMode(false);
        localStorage.setItem('accessibility', JSON.stringify({
            fontSize,
            contrastMode,
            darkMode: false
        }));
    };
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

    const isInitialLoad = useRef(true)
    const isLoadingRef = useRef(false)


    const {speak, stop, speaking} = useSpeechSynthesis()

    const {isListening, toggleListening, transcript} = useVoiceCommands({
        commands: {
            "0": () => readInstruction(),
            "1": () => readCurrentArticle(),
            "2": () => navigateArticle(1),
            "3": () => navigateArticle(-1),
            "4": () => stop(),
            "5": (categoryName) => changeCategory(categoryName),
            "6": () => increaseFontSize(),
            "7": () => decreaseFontSize(),
            "8": () => toggleContrastMode(),
            "9": () => {
                toggleDarkMode()
            },
            "10": () => {
                toggleLightMode()
            },
            "11": () => {
                speak("Xin lỗi, tôi không hiểu yêu cầu của bạn. Hãy thử nói lại.");
            },
            "12": () => showWeatherInfo(),
            "13": () => showGoldPriceInfo()
        },
    })

    // Load all news data once when the component mounts
    useEffect(() => {
        loadNews()
    }, [])

    useEffect(() => {
        // Only read instructions on first load and only once
        if (isInitialLoad.current) {
            const welcomeMessage = `Chào mừng đến với ứng dụng nghe tin tức. Nhấn giữ phím cách để nói.
            Nói hướng dẫn để nghe hướng dẫn sử dụng. Đang tải tin tức, xin vui lòng chờ.`;

            speak(welcomeMessage, () => {
                setIsWelcomeComplete(true);
            }, true);
        }

        return () => {
            stop();
        };
    }, []);


    // Filter articles whenever category changes
    useEffect(() => {
        filterArticlesByCategory(category)
    }, [category, allArticles])

    // In App.jsx - update the useEffect to apply font size to html element
    useEffect(() => {
        // Apply font size to html element
        document.documentElement.style.fontSize = `${fontSize}%`;

        // Apply theme classes for contrast and dark mode
        const classList = document.documentElement.classList;

        if (contrastMode) {
            classList.add('high-contrast');
        } else {
            classList.remove('high-contrast');
        }

        if (darkMode) {
            classList.add('dark-theme');
        } else {
            classList.remove('dark-theme');
        }

        // Save preferences to localStorage
        localStorage.setItem('accessibility', JSON.stringify({
            fontSize,
            contrastMode,
            darkMode
        }));
    }, [fontSize, contrastMode, darkMode]);

    // Add this effect to load saved preferences on mount
    useEffect(() => {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('accessibility'));
            if (savedSettings) {
                setFontSize(savedSettings.fontSize || 100);
                setContrastMode(savedSettings.contrastMode || false);
                setDarkMode(savedSettings.darkMode || false);
            }
        } catch (err) {
            console.error('Error loading accessibility settings', err);
        }
    }, []);


    // Add this effect to App.jsx
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if space is pressed and not typing in input fields
            if (e.code === 'Space' &&
                !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault(); // Prevent page scroll
                if (!isListening) {
                    toggleListening();
                }
            }
        };

        const handleKeyUp = (e) => {
            // Stop listening when space is released
            if (e.code === 'Space' &&
                !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                if (isListening) {
                    toggleListening();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isListening, toggleListening]);


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


    // Then replace your existing weather function with this:
    const showWeatherInfo = async () => {
        try {
            const data = await fetchWeatherData();
            setWeatherData(data);

            // Use Gemini AI to analyze the weather data
            const weatherSummary = await analyzeWeatherData(data);

            // Set the weather text to display in the article panel
            setSelectedArticleText(weatherSummary);

            // Read the weather information
            speak(weatherSummary);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            const errorMessage = "Không thể tải thông tin thời tiết.";
            setSelectedArticleText(errorMessage);
            speak(errorMessage);
        }
    };

    // And replace your gold price function with this:
    const showGoldPriceInfo = async () => {
        try {
            const data = await fetchGoldPrice();
            setGoldPriceData(data);

            // Use Gemini AI to analyze the gold price data
            const goldSummary = await analyzeGoldPriceData(data);

            // Set the gold price text to display in the article panel
            setSelectedArticleText(goldSummary);

            // Read the gold price information
            speak(goldSummary);
        } catch (error) {
            console.error("Error fetching gold price data:", error);
            const errorMessage = "Không thể tải thông tin giá vàng.";
            setSelectedArticleText(errorMessage);
            speak(errorMessage);
        }
    };


    const readInstruction = () => {
        const instructions = `
        Hướng dẫn sử dụng bằng giọng nói:
        Nói đọc. để nghe nội dung bài báo hiện tại.
        tiếp theo. để chuyển đến bài báo tiếp theo.
        trước đó. để quay lại bài báo trước.
        dừng lại. để dừng đọc.
        chuyên mục. và tên chuyên mục. để lọc tin tức theo chuyên mục.
        danh sách chuyên mục bao gồm: tổng hợp, kinh doanh, công nghệ, giải trí, thể thao, sức khỏe, khoa học.
        tăng hoặc giảm cỡ chữ. để điều chỉnh kích thước chữ.
        chế độ tương phản. để bật tắt chế độ tương phản cao.
        chế độ tối hoặc sáng. để thay đổi giao diện.
        thời tiết. để nghe thông tin thời tiết.
        giá vàng. để nghe thông tin giá vàng.
    `;

        speak(instructions);
    };

    const filterArticlesByCategory = (currentCategory) => {
        if (allArticles.length === 0) return;

        // Filter articles by selected category
        const filteredArticles = currentCategory === "general"
            ? allArticles
            : allArticles.filter(article => article.category === currentCategory);

        setArticles(filteredArticles);
        setCurrentArticleIndex(0);

        // Check if this is initial load and welcome is complete
        if (isInitialLoad.current && isWelcomeComplete && filteredArticles.length > 0) {
            isInitialLoad.current = false;
            speak(`Đã tải ${filteredArticles.length} bài báo`);
        }
        // Announce for category changes (not initial)
        else if (!isInitialLoad.current && filteredArticles.length > 0) {
            const vietnameseName = categoryNameInVietnamese[currentCategory] || currentCategory;
            speak(`Đã tải ${filteredArticles.length} bài báo trong chuyên mục ${vietnameseName}.`);
        }
        // No articles found
        else if (!isInitialLoad.current || isWelcomeComplete) {
            speak('Không tìm thấy bài báo nào trong chuyên mục này.');
        }
    };

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
        }, 200);
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

        // Combine title, date info, description and content for reading
        const textToRead = `${article.title}${dateInfo}. Tác giả ${article.metadata.author}. ${article.description || ""}. ${articleContent}`

        // Set the selected article text for display in the side panel
        setSelectedArticleText(articleContent || "Không có nội dung chi tiết.")

        speak(textToRead)
    }

    const navigateArticle = (direction) => {
        stop()
        let newIndex = currentArticleIndex + direction
        if (newIndex < 0) {
            newIndex = 0;
        }
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
                    <h1>Nghe Tin Nhanh</h1>
                    <div className="info-widgets">
                        <p className="accessibility-info">
                            Điều khiển lệnh thoại: "đọc", "tiếp theo", "trước đó", "dừng lại", "chuyên mục [tên]", <br></br>
                            "tăng cỡ chữ", "giảm cỡ chữ", "chế độ tương phản", "chế độ tối", "chế độ sáng"
                        </p>
                        <WeatherDisplay/>

                    </div>

                </header>

                <VoiceControls
                    isListening={isListening}
                    toggleListening={toggleListening}
                    transcript={transcript}
                    speaking={speaking}
                    stopSpeaking={stop}
                />

                <AccessibilityControls
                    fontSize={fontSize}
                    onIncreaseFontSize={increaseFontSize}
                    onDecreaseFontSize={decreaseFontSize}
                    contrastMode={contrastMode}
                    toggleContrastMode={toggleContrastMode}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                />


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
                    <h3>Nội dung</h3>
                    <div className="article-content">
                        {selectedArticleText}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App