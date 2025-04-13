"use client"

const CategorySelector = ({ currentCategory, onSelectCategory }) => {
  const categories = ["general", "business", "entertainment", "health", "science", "sports", "technology"]

  return (
    <div className="category-selector">
      <h2 className="sr-only">News Categories</h2>
      <div className="categories-list">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`category-button ${currentCategory === category ? "active" : ""}`}
            aria-pressed={currentCategory === category}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      <p className="voice-tip">Tip: Say "category [name]" to change categories with your voice</p>
    </div>
  )
}

export default CategorySelector
