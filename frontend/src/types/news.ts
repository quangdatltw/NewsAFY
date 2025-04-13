export interface NewsArticle {
  title: string
  description: string
  content: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
}

export type NewsCategory = "general" | "business" | "entertainment" | "health" | "science" | "sports" | "technology"
