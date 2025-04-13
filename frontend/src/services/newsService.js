// You'll need to get an API key from NewsAPI.org or a similar service
const API_KEY = import.meta.env.VITE_NEWS_API_KEY || "YOUR_API_KEY"
const BASE_URL = "https://newsapi.org/v2"

export const fetchNews = async (category = "general") => {
  try {
    // If you don't have an API key, use the sample data for development
    if (API_KEY === "YOUR_API_KEY") {
      return sampleNewsData
    }

    const response = await fetch(`${BASE_URL}/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`)
    }

    const data = await response.json()
    return data.articles
  } catch (error) {
    console.error("Error fetching news:", error)
    // Return sample data as fallback
    return sampleNewsData
  }
}

// Sample data for development or when API is not available
const sampleNewsData = [
  {
    title: "Scientists Discover New Species in Amazon Rainforest",
    description:
      "Researchers have identified a previously unknown species of frog with remarkable adaptive capabilities.",
    content:
      "A team of international scientists has discovered a new species of tree frog in the Amazon rainforest. The species, named Hyla amazonica, has unique adaptations that allow it to change color based on environmental conditions.",
    url: "https://example.com/news/science/new-species",
    urlToImage: "https://via.placeholder.com/600x400?text=Amazon+Rainforest",
    publishedAt: "2023-04-15T08:30:00Z",
    source: {
      name: "Science Daily",
    },
  },
  {
    title: "Global Tech Conference Announces Revolutionary AI Tools",
    description:
      "The annual TechWorld conference unveiled several groundbreaking artificial intelligence applications.",
    content:
      "At this year's TechWorld conference, major tech companies presented new AI tools designed to transform industries from healthcare to transportation. The most notable announcement was an AI system capable of predicting structural weaknesses in buildings with 99% accuracy.",
    url: "https://example.com/news/technology/ai-tools",
    urlToImage: "https://via.placeholder.com/600x400?text=Tech+Conference",
    publishedAt: "2023-04-14T14:15:00Z",
    source: {
      name: "Tech Insider",
    },
  },
  {
    title: "New Study Links Exercise to Improved Mental Health",
    description:
      "Research confirms that regular physical activity significantly reduces symptoms of anxiety and depression.",
    content:
      "A comprehensive study involving over 10,000 participants has found that just 30 minutes of moderate exercise three times a week can reduce symptoms of depression by up to 40%. The research, conducted over five years, also noted improvements in sleep quality and overall life satisfaction.",
    url: "https://example.com/news/health/exercise-mental-health",
    urlToImage: "https://via.placeholder.com/600x400?text=Exercise+and+Health",
    publishedAt: "2023-04-13T09:45:00Z",
    source: {
      name: "Health Journal",
    },
  },
  {
    title: "Historic Peace Agreement Signed in Middle East",
    description: "After decades of conflict, two neighboring countries have agreed to a comprehensive peace treaty.",
    content:
      'In a landmark diplomatic achievement, representatives from both nations signed a peace treaty that addresses territorial disputes, resource sharing, and security cooperation. International observers have called this agreement "a model for conflict resolution in the region."',
    url: "https://example.com/news/world/peace-agreement",
    urlToImage: "https://via.placeholder.com/600x400?text=Peace+Agreement+Signing",
    publishedAt: "2023-04-12T16:20:00Z",
    source: {
      name: "World News Network",
    },
  },
  {
    title: "Major Breakthrough in Renewable Energy Storage",
    description:
      "Engineers develop a new battery technology that could solve the intermittency problem of renewable energy.",
    content:
      "Scientists have created a new type of grid-scale battery that can store renewable energy for months with minimal loss. This technology could make solar and wind power reliable year-round energy sources, potentially accelerating the transition away from fossil fuels.",
    url: "https://example.com/news/science/energy-storage",
    urlToImage: "https://via.placeholder.com/600x400?text=Renewable+Energy",
    publishedAt: "2023-04-11T11:10:00Z",
    source: {
      name: "Future Energy",
    },
  },
]
