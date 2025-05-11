const categorizeArticlesWithAI = async (articles) => {
    try {
        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_TOKEN;
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

        // Extract titles for categorization
        const titles = articles.map(article => article.title);

        const prompt = `
                      Categorize each of the following news titles in vietnamese into ONE of these categories:
                      "general", "business", "entertainment", "health", "science", "sports", "technology"
            
                      Return your answer as a valid JSON array with format:
                      [{"title": "article title", "category": "category name"}, ...]
            
                      News titles:
                      ${titles.map((title, i) => `${i + 1}. ${title}`).join('\n')}
                    `;

        const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {text: prompt}
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data)


        // Extract the JSON text from response - handle updated Gemini API structure
        let responseText;
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            responseText = data.candidates[0].content.parts[0].text;
        } else if (data.content?.parts?.[0]?.text) {
            // Alternative structure in case API returns differently
            responseText = data.content.parts[0].text;
        } else {
            throw new Error("Unexpected API response structure");
        }

        // Find JSON content in the response - it might be surrounded by code blocks
        const jsonMatch = responseText.match(/\[\s*\{.*}\s*]/s);
        if (!jsonMatch) {
            throw new Error("Could not parse AI response");
        }

        // Parse the JSON result
        const categorizedArticles = JSON.parse(jsonMatch[0]);
        console.log(categorizedArticles);

        // Map back to the original article objects with added category
        return articles.map(article => {
            const match = categorizedArticles.find(item => item.title === article.title);
            return {
                ...article,
                category: match ? match.category : "general" // Default to general if no match
            };
        });
    } catch (error) {
        console.error("Error categorizing articles:", error);
        // Return original articles with default category if AI categorization fails
        return articles.map(article => ({...article, category: "general"}));
    }
};

export {categorizeArticlesWithAI};