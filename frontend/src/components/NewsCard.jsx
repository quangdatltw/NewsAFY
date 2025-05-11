"use client"

const NewsCard = ({article, isActive, onRead}) => {

    // Format date to desired format
    let formattedDate = "";
    if (article.metadata && article.metadata.date) {
        // Original format: "Thứ bảy, 10/5/2025, 21:00 (GMT+7)"
        // Target format: "bài viết lúc 09:37 Chủ nhật, 11/5"
        const dateParts = article.metadata.date.split(", ");
        if (dateParts.length >= 2) {
            const dayOfWeek = dateParts[0]; // e.g., "Thứ bảy"
            const dateAndTime = dateParts[1].split(" "); // e.g., ["10/5/2025", "21:00"]

            if (dateAndTime.length >= 1) {
                const time = dateParts[2]?.split(" ")[0] || ""; // e.g., "21:00"
                formattedDate = `bài viết lúc ${time} ${dayOfWeek}, ${dateAndTime[0]}`;
            }
        }
    }
    
    return (
        <article className={`news-card ${isActive ? "active" : ""}`} aria-selected={isActive}
                 tabIndex={isActive ? 0 : -1}>

            <div className="news-content">
                <h2>{article.title}</h2>
                <p className="news-source">
                    {formattedDate && (
                        <p className="news-source">{formattedDate}</p>
                    )}
                </p>

                <p className="news-description">{article.description}</p>

                <div className="news-actions">
                    <button onClick={onRead} className="read-button" aria-label="Đọc bài báo này">
                        Đọc Bài Này
                    </button>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="source-link">
                        Xem Thêm
                    </a>
                </div>
            </div>
        </article>
    )
}

export default NewsCard
