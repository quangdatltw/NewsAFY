"use client"

const NewsCard = ({ article, isActive, onRead }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <article className={`news-card ${isActive ? "active" : ""}`} aria-selected={isActive} tabIndex={isActive ? 0 : -1}>
      {article.urlToImage ? (
        <img src={article.urlToImage || "/placeholder.svg"} alt="" className="news-image" aria-hidden="true" />
      ) : (
        <div className="news-image-placeholder" aria-hidden="true">
          <span>No image available</span>
        </div>
      )}

      <div className="news-content">
        <h2>{article.title}</h2>
        <p className="news-source">
          {article.source.name} • {formatDate(article.publishedAt)}
        </p>
        <p className="news-description">{article.description}</p>

        <div className="news-actions">
          <button onClick={onRead} className="read-button" aria-label="Read this article aloud">
            Read Aloud
          </button>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="source-link">
            Read More
          </a>
        </div>
      </div>
    </article>
  )
}

export default NewsCard
