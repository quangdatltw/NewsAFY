import OpenAI from "openai";

// Get tokens from environment variables
const tokens = [
    import.meta.env.VITE_GITHUB_TOKEN_1 || "",
    import.meta.env.VITE_GITHUB_TOKEN_2 || "",
    import.meta.env.VITE_GITHUB_TOKEN_3 || "",
    import.meta.env.VITE_GITHUB_TOKEN_4 || ""
].filter(token => token !== "");

let currentTokenIndex = 0;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1-nano";

export const searchNewsByKeyword = async (keyword, articles) => {
    if (!keyword || articles.length === 0) {
        return { success: false, message: "Vui lòng cung cấp từ khóa và bài báo để tìm kiếm." };
    }

    // Prepare article data (only title and description)
    const articlesData = articles.map((article, index) => ({
        index,
        title: article.title || "",
        description: article.description || ""
    }));

    let attempts = 0;
    const maxAttempts = tokens.length;

    while (attempts < maxAttempts) {
        try {
            const token = tokens[currentTokenIndex];
            const client = new OpenAI({
                baseURL: endpoint,
                apiKey: token,
                dangerouslyAllowBrowser: true
            });

            const prompt = `
                Tìm kiếm bài báo phù hợp với từ khóa: "${keyword}"
                Dưới đây là danh sách các bài báo với tiêu đề và mô tả:
                ${JSON.stringify(articlesData)}

                Phân tích ngữ nghĩa và ngữ cảnh, dựa vào từ khóa trùng khớp hoặc gần trùng khớp.
                Trả về các chỉ số (index) của tối đa 3 bài báo phù hợp nhất.
                CHỈ trả về một mảng JSON chứa các chỉ số, ví dụ: [0, 5, 8]
            `;

            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một trợ lý tìm kiếm tin tức. Phân tích dữ liệu và tìm bài báo phù hợp nhất với từ khóa. Chỉ trả về các chỉ số dưới dạng mảng JSON."
                    },
                    {role: "user", content: prompt}
                ],
                temperature: 0.3,
                max_tokens: 50,
                model: model
            });

            const content = response.choices[0].message.content.trim();
            let matchedIndices = [];

            try {
                // Try to parse JSON array response
                matchedIndices = JSON.parse(content);
                if (!Array.isArray(matchedIndices)) {
                    throw new Error("Response is not an array");
                }

                // Verify indices are within bounds
                matchedIndices = matchedIndices.filter(index =>
                    Number.isInteger(index) && index >= 0 && index < articles.length
                );
            } catch (e) {
                console.log("Failed to parse JSON, extracting numbers", e);
                const indices = content.match(/\d+/g);
                if (indices) {
                    matchedIndices = indices.map(Number)
                        .filter(index => index < articles.length);
                }
            }

            return {
                success: true,
                matchedIndices,
                message: matchedIndices.length > 0
                    ? `Tìm thấy ${matchedIndices.length} bài báo phù hợp`
                    : `Không tìm thấy bài báo nào phù hợp với từ khóa ${keyword}`
            };

        } catch (error) {
            console.error(`Error with token ${currentTokenIndex + 1}:`, error.message);

            // Move to the next token
            currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
            attempts++;

            if (attempts >= maxAttempts) {
                console.error("All tokens failed. No more tokens to try.");

                // Fall back to basic search
                return fallbackSearch(keyword, articles);
            }

            console.log(`Switching to token ${currentTokenIndex + 1}. Attempt ${attempts + 1}/${maxAttempts}`);
        }
    }

    // Should not reach here, but if it does, fall back
    return fallbackSearch(keyword, articles);
};

// Basic search fallback when API fails
const fallbackSearch = (keyword, articles) => {
    const searchTerm = keyword.toLowerCase();
    const foundArticles = articles.filter((article, index) =>
        (article.title && article.title.toLowerCase().includes(searchTerm)) ||
        (article.description && article.description.toLowerCase().includes(searchTerm))
    ).map(article => articles.findIndex(a => a.title === article.title));

    return {
        success: true,
        matchedIndices: foundArticles,
        message: foundArticles.length > 0
            ? `Tìm thấy ${foundArticles.length} bài báo có từ khóa ${keyword}`
            : `Không tìm thấy bài báo nào có từ khóa ${keyword}`,
        isBasicSearch: true
    };
};