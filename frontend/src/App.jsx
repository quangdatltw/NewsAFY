import {useCallback, useEffect, useRef, useState} from "react"
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
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [categoryData, setCategoryData] = useState({})
    const [selectedArticleText, setSelectedArticleText] = useState("");
    const [fontSize, setFontSize] = useState(110);
    const [contrastMode, setContrastMode] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isWelcomeComplete, setIsWelcomeComplete] = useState(false);

    const isInitialLoad = useRef(true)
    const isLoadingRef = useRef(false)
    const articleStateRef = useRef([]);
    const currentArticleIndexRef = useRef(currentArticleIndex);
    const currentCategoryRef = useRef(category);

    // Update the ref whenever the articles state changes
    useEffect(() => {
        articleStateRef.current = articles;
    }, [articles]);

    useEffect(() => {
        currentArticleIndexRef.current = currentArticleIndex;
    }, [currentArticleIndex]);

    useEffect(() => {
        currentCategoryRef.current = category;
    }, [category]);

    const {speak, stop, speaking} = useSpeechSynthesis()

    // Define all command handlers using useCallback to ensure they always access
    // the latest state via refs instead of closures
    const readInstruction = useCallback(() => {
        const instructions = `
            Hướng dẫn sử dụng bằng giọng nói:
            Nói đọc. để nghe nội dung bài báo hiện tại.
            Đọc số thứ tự bài báo. để nghe nội dung bài báo theo số thứ tự.
            tiếp theo. để chuyển đến bài báo tiếp theo.
            trước đó. để quay lại bài báo trước.
            dừng lại. để dừng đọc.
            đọc tiêu đề. để nghe tất cả tiêu đề bài báo.
            chuyên mục. và tên chuyên mục. để lọc tin tức theo chuyên mục.
            danh sách chuyên mục bao gồm: tổng hợp, kinh doanh, công nghệ, giải trí, thể thao, sức khỏe, khoa học.
            tăng hoặc giảm cỡ chữ. để điều chỉnh kích thước chữ.
            chế độ tương phản. để bật tắt chế độ tương phản cao.
            chế độ tối hoặc sáng. để thay đổi giao diện.
            thời tiết. để nghe thông tin thời tiết.
            giá vàng. để nghe thông tin giá vàng. 
        `;

        speak(instructions);
    }, [speak]);

    const readTitles = useCallback(() => {
        // Important: Get current articles from ref, not from closure
        const currentArticles = articleStateRef.current;

        if (!currentArticles || currentArticles.length === 0) {
            speak("Không có bài báo nào để đọc. Vui lòng chờ tin tức được tải hoặc chọn chuyên mục khác.");
            if (isLoadingRef.current) {
                speak("Đang tải tin tức, xin vui lòng chờ.");
            }
            return;
        }

        const categoryName = categoryNameInVietnamese[currentCategoryRef.current] || category;
        let titleText = `Tiêu đề ${currentArticles.length} bài báo trong chuyên mục ${categoryName}. `;

        currentArticles.forEach((article, index) => {
            titleText += `\nBài ${index + 1}: ${article.title} `;
        });

        // Set the selected article text to make titles visible
        setSelectedArticleText(titleText);

        // Read the titles
        speak(titleText);
    }, [speak, category, setSelectedArticleText]);

    const readCurrentArticle = useCallback(() => {
        const currentArticles = articleStateRef.current;
        if (currentArticles.length === 0) return;

        // Use currentArticleIndexRef instead of currentArticleIndex for the most up-to-date value
        const article = currentArticles[currentArticleIndexRef.current];

        // Format date information if available
        let dateInfo = "";
        if (article.metadata && article.metadata.date) {
            // Transform date format
            const dateParts = article.metadata.date.split(", ");
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

        // Get the full article content or fall back to description
        const articleContent = article.textContent;

        // Combine title, date info, description and content for reading
        const textToRead = `${article.title}${dateInfo}. Tác giả ${article.metadata.author || "không rõ"}. ${article.description || ""}. ${articleContent}`;

        // Set the selected article text for display in the side panel
        setSelectedArticleText(articleContent || "Không có nội dung chi tiết.");

        speak(textToRead);
    }, [speak, setSelectedArticleText]);

    const readArticleByNumber = useCallback((articleNumber) => {
        const currentArticles = articleStateRef.current;

        // Convert to number and adjust for zero-indexing
        const index = parseInt(articleNumber, 10) - 1;

        // Validate the index
        if (isNaN(index) || index < 0 || index >= currentArticles.length) {
            speak(`Bài báo số ${articleNumber} không tồn tại. Hiện có ${currentArticles.length} bài báo.`);
            return;
        }

        // Set the current article index and read it
        setCurrentArticleIndex(index);
        speak(`Chuyển đến bài báo số ${index + 1}`);

        // Use timeout to ensure state updates before reading
        setTimeout(() => {
            const articleToRead = currentArticles[index];

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
            const textToRead = `${articleToRead.title}${dateInfo}. Tác giả ${articleToRead.metadata?.author || "không rõ"}. ${articleToRead.description || ""}. ${articleContent}`;

            // Set the selected article text for display
            setSelectedArticleText(articleContent || "Không có nội dung chi tiết.");

            // Read the article
            speak(textToRead);
        }, 200);
    }, [speak, setCurrentArticleIndex, setSelectedArticleText]);

    const navigateArticle = useCallback((direction) => {
        stop();
        const currentArticles = articleStateRef.current;
        let newIndex = currentArticleIndexRef.current + direction;

        if (newIndex < 0) {
            newIndex = 0;
        }

        if (newIndex >= 0 && newIndex < currentArticles.length) {
            setCurrentArticleIndex(newIndex);
            speak(`Bài báo ${newIndex + 1} trong số ${currentArticles.length}.`);
        } else {
            speak(newIndex < 0 ? "Bạn đang ở bài đầu tiên" : "Bạn đang ở bài cuối cùng");
        }
    }, [stop, speak, currentArticleIndex, setCurrentArticleIndex]);

    const changeCategory = useCallback((newCategory) => {
        stop();
        setCategory(newCategory);
        const vietnameseName = categoryNameInVietnamese[newCategory] || newCategory;
        speak(`Đang chuyển sang chuyên mục ${vietnameseName}`);
    }, [stop, speak, setCategory]);

    const increaseFontSize = useCallback(() => {
        if (fontSize < 200) {
            setFontSize(prevSize => prevSize + 10);
        }
    }, [fontSize, setFontSize]);

    const decreaseFontSize = useCallback(() => {
        if (fontSize > 80) {
            setFontSize(prevSize => prevSize - 10);
        }
    }, [fontSize, setFontSize]);

    const toggleContrastMode = useCallback(() => {
        setContrastMode(prev => !prev);
    }, [setContrastMode]);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const newValue = !prev;
            localStorage.setItem('accessibility', JSON.stringify({
                fontSize,
                contrastMode,
                darkMode: newValue
            }));
            return newValue;
        });
    }, [fontSize, contrastMode, setDarkMode]);

    const toggleLightMode = useCallback(() => {
        setDarkMode(false);
        localStorage.setItem('accessibility', JSON.stringify({
            fontSize,
            contrastMode,
            darkMode: false
        }));
    }, [fontSize, contrastMode, setDarkMode]);

    const showWeatherInfo = useCallback(async () => {
        try {
            const data = await fetchWeatherData();
            const weatherSummary = await analyzeWeatherData(data);
            setSelectedArticleText(weatherSummary);
            speak(weatherSummary);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            const errorMessage = "Không thể tải thông tin thời tiết.";
            setSelectedArticleText(errorMessage);
            speak(errorMessage);
        }
    }, [speak, setSelectedArticleText]);

    const showGoldPriceInfo = useCallback(async () => {
        try {
            const data = await fetchGoldPrice();
            const goldSummary = await analyzeGoldPriceData(data);
            setSelectedArticleText(goldSummary);
            speak(goldSummary);
        } catch (error) {
            console.error("Error fetching gold price data:", error);
            const errorMessage = "Không thể tải thông tin giá vàng.";
            setSelectedArticleText(errorMessage);
            speak(errorMessage);
        }
    }, [speak, setSelectedArticleText]);

    const handleReadArticle = useCallback((index) => {
        setCurrentArticleIndex(index);
        // Use a small timeout to ensure state is updated before reading
        setTimeout(() => {
            // Get the article at the specified index directly from the ref
            const currentArticles = articleStateRef.current;
            const articleToRead = currentArticles[index];

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
    }, [speak, setCurrentArticleIndex, setSelectedArticleText]);

    const categoryNameInVietnamese = {
        "general": "tổng hợp",
        "politics": "chính trị",
        "business": "kinh doanh",
        "technology": "công nghệ",
        "entertainment": "giải trí",
        "sports": "thể thao",
        "health": "sức khỏe",
        "science": "khoa học",
    };

    // Register all command handlers after defining them with useCallback
    const {isListening, toggleListening, transcript} = useVoiceCommands({
        commands: {
            "0": readInstruction,
            "1": readCurrentArticle,
            "2": () => navigateArticle(1),
            "3": () => navigateArticle(-1),
            "4": stop,
            "5": changeCategory,
            "6": increaseFontSize,
            "7": decreaseFontSize,
            "8": toggleContrastMode,
            "9": toggleDarkMode,
            "10": toggleLightMode,
            "11": () => {
                speak("Xin lỗi, tôi không hiểu yêu cầu của bạn. Hãy thử nói lại.");
            },
            "12": showWeatherInfo,
            "13": showGoldPriceInfo,
            "14": readTitles,
            "15": readArticleByNumber,
        },
    });

    const loadNews = useCallback(async () => {
        // Prevent concurrent requests
        if (isLoadingRef.current) return;

        try {
            isLoadingRef.current = true;
            setIsLoading(true);
            setError(null);


            let data;
            data = await fetchNews();


            // Remove flushSync - use regular state updates instead
            setCategoryData(data.categoryData);
            setAllArticles(data.articles);

            return data;
        } catch (err) {
            console.error('News loading error:', err);
            setError("Không thể tải tin tức. Vui lòng thử lại sau.");
            speak("Không thể tải tin tức. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [speak]);

    // Create a separate effect for category changes
    useEffect(() => {
        if (allArticles.length === 0) return;

        // Filter articles by selected category
        const filteredArticles = category === "general"
            ? allArticles
            : allArticles.filter(article => article.category === category);

        setArticles(filteredArticles);
        setCurrentArticleIndex(0);

        // Only announce category changes if we're past initial load
        // and the category reference has actually changed
        if (!isInitialLoad.current && filteredArticles.length > 0) {
            const vietnameseName = categoryNameInVietnamese[category] || category;
            speak(`Đã tải ${filteredArticles.length} bài báo trong chuyên mục ${vietnameseName}.`);
        } else if (!isInitialLoad.current && currentCategoryRef.current !== category) {
            speak('Không tìm thấy bài báo nào trong chuyên mục này.');
        }

        // Update current category reference
        currentCategoryRef.current = category;
    }, [category, allArticles]);

    // Separate effect for initial load announcement
    useEffect(() => {
        if (isInitialLoad.current && isWelcomeComplete && articles.length > 0) {
            isInitialLoad.current = false;
            speak(`Đã tải ${articles.length} bài báo. Nói đọc để đọc bài đầu, hoặc nói đọc tiêu đề để nghe tiêu đề các bài báo`);
        }
    }, [articles, isWelcomeComplete, speak]);

    // Load news and welcome message on initial render
    useEffect(() => {
        // Only read instructions on first load and only once
        if (isInitialLoad.current) {
            setTimeout(() => {
                loadNews();
            }, 2000);

            const welcomeMessage = `Chào mừng bạn đã đến với NGHE TIN NHANH . Nhấn giữ phím cách để nói.
                Nói hướng dẫn để nghe hướng dẫn sử dụng. Đang tải tin tức, xin vui lòng chờ.`;

            speak(welcomeMessage, () => {
                setIsWelcomeComplete(true);
            }, true);
        }

        return () => {
            stop();
        };
    }, [loadNews, speak, stop]);


    // Apply accessibility settings
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`;
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

        localStorage.setItem('accessibility', JSON.stringify({
            fontSize,
            contrastMode,
            darkMode
        }));
    }, [fontSize, contrastMode, darkMode]);

    // Load saved accessibility preferences
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

    // Space key handling for voice commands
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' &&
                !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                if (!isListening) {
                    toggleListening();
                }
            }
        };

        const handleKeyUp = (e) => {
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

    return (
        <div className="app-layout">
            <div className="app-container">
                <header className="app-header">
                    <h1>Nghe Tin Nhanh</h1>
                    <div className="info-widgets">
                        <div className="accessibility-info">
                            Điều khiển lệnh thoại: <br></br>
                            <div className="info-widgets">
                                <div>- đọc<br></br>- tiếp theo<br></br>- trước đó <br></br>- dừng lại<br></br></div>
                                <div> - chuyên mục [tên] <br></br>- đọc bài [số thứ tự] <br></br>- đọc tiêu đề <br></br> </div>
                            </div>
                        </div>
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