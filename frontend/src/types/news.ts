export interface NewsArticle {
    title: string
    description: string
    content: string
    url: string
    source: {
        name: string
    }
}

export type NewsCategory = "general" | "business" | "entertainment" | "health" | "science" | "sports" | "technology"
