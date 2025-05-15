import OpenAI from "openai";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1-nano";

// Array of GitHub tokens
// In commandSelector.js, replace the tokens with placeholders:
const tokens = [
    import.meta.env.VITE_GITHUB_TOKEN_1 || "",
    import.meta.env.VITE_GITHUB_TOKEN_2 || "",
    import.meta.env.VITE_GITHUB_TOKEN_3 || "",
    import.meta.env.VITE_GITHUB_TOKEN_4 || ""
].filter(token => token !== "");

// Track the current token index
let currentTokenIndex = 0;

// Function to get the next token
const getNextToken = () => {
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
    return tokens[currentTokenIndex];
};

// Pre-process voice input
const preprocessInput = (input) => {
    if (!input) return "";

    // Convert to lowercase and trim spaces
    let processed = input.toLowerCase().trim();

    // Common voice recognition errors in Vietnamese
    const corrections = {
        "mọc": "đọc",
        "cọc": "đọc",
        "độc": "đọc",
        "đọc tin tức": "đọc tin",
        "tin tiếp theo": "tin tiếp",
        "tin trước đó": "tin trước",
        "dừng đọc": "dừng",
        "tiếp tục": "tiếp",
        "chuyên mục công nghệ": "chuyên mục technology",
        "chuyên mục kinh doanh": "chuyên mục business",
        "chuyên mục thể thao": "chuyên mục sports",
        "chuyên mục giải trí": "chuyên mục entertainment",
        "chuyên mục sức khỏe": "chuyên mục health",
        "chuyên mục khoa học": "chuyên mục science",
        "chuyên mục tổng hợp": "chuyên mục general"
    };

    Object.entries(corrections).forEach(([wrong, correct]) => {
        processed = processed.replace(new RegExp(wrong, 'g'), correct);
    });

    console.log("Preprocessed input:", processed);
    return processed;
};

export async function commandSelector(command) {
    let attempts = 0;
    const maxAttempts = tokens.length;

    // Preprocess the command
    const processedCommand = preprocessInput(command);

    // Try direct matching for common commands first
    const directMatches = {
        "đọc tin": "1",
        "tin tiếp": "2",
        "tiếp theo": "2",
        "tiếp": "2",
        "Rừng.": "4",
        "rừng.": "4",
        "dùng.": "4",
        "dùng": "4",
        "Dùng.": "4",
        "Dùng": "4",
        "Rừng": "4",
        "tin trước": "3",
        "trước đó": "3",
        "quay lại": "3",
        "dừng": "4",
        "tạm dừng": "4",
        "ngừng": "4",
        "tăng cỡ chữ": "6",
        "chữ to": "6",
        "giảm cỡ chữ": "7",
        "chữ nhỏ": "7",
        "chế độ tương phản": "8",
        "chế độ tối": "9",
        "chế độ sáng": "10",
        "thời tiết": "12",
        "giá vàng": "13",
        "đọc tiêu đề": "14"

    };

    // Check for direct matches
    for (const [pattern, commandNumber] of Object.entries(directMatches)) {
        if (processedCommand.includes(pattern)) {
            console.log("Direct match found:", commandNumber);
            return commandNumber;
        }
    }

    // Check for category changes
    if (processedCommand.includes("chuyên mục")) {
        const categories = {
            "technology": "công nghệ",
            "business": "kinh doanh",
            "entertainment": "giải trí",
            "health": "sức khỏe",
            "science": "khoa học",
            "sports": "thể thao",
            "general": "tổng hợp"
        };

        for (const [categoryEn, categoryVi] of Object.entries(categories)) {
            if (processedCommand.includes(categoryVi)) {
                console.log("Category match found:", categoryEn);
                return `5:${categoryEn}`;  // Return command number with parameter
            }
        }
    }

    // If no direct match, use the API
    while (attempts < maxAttempts) {
        try {
            const token = tokens[currentTokenIndex];
            const client = new OpenAI({
                baseURL: endpoint,
                apiKey: token,
                dangerouslyAllowBrowser: true
            });

            const functionList = `
            Respond only with a single digit number representing the command.
            
            Mã số lệnh tương ứng:
            "0" - Đọc hướng dẫn sử dụng (khi người dùng nói hướng dẫn, hướng dẫn sử dụng)
            "1" - Đọc tin tức hiện tại (khi người dùng nói đọc tin, đọc, đọc bài)
            "2" - Chuyển sang tin tiếp theo (khi người dùng nói tin tiếp, tiếp theo, tiếp)
            "3" - Quay lại tin trước đó (khi người dùng nói tin trước, trước đó, quay lại)
            "4" - Dừng việc đọc (khi người dùng nói dừng, dừng lại, tạm dừng)
            "6" - Tăng kích thước chữ (khi người dùng nói tăng cỡ chữ, chữ to)
            "7" - Giảm kích thước chữ (khi người dùng nói giảm cỡ chữ, chữ nhỏ)
            "8" - Bật/tắt chế độ tương phản cao (khi người dùng nói chế độ tương phản)
            "9" - Bật chế độ tối (khi người dùng nói chế độ tối)
            "10" - Bật chế độ sáng (khi người dùng nói chế độ sáng)
            "11" - Khi không trùng khớp với lệnh nào
            "12" - Đọc thời tiết (khi người dùng nói thời tiết)
            "13" - Đọc giá vàng (khi người dùng nói giá vàng)
            "14" - Đọc tiêu đề (khi người dùng nói đọc tiêu đề)
         
            
            Trường hợp đặc biệt:
            Nếu người dùng nói về chuyên mục, trả về theo dạng "5:tên chuyên mục" với tên chuyên mục là một trong các giá trị sau:
            - technology (khi người dùng nói chuyên mục công nghệ)
            - business (khi người dùng nói chuyên mục kinh doanh)
            - sports (khi người dùng nói chuyên mục thể thao)
            - entertainment (khi người dùng nói chuyên mục giải trí)
            - health (khi người dùng nói chuyên mục sức khỏe)
            - science (khi người dùng nói chuyên mục khoa học)
            - general (khi người dùng nói chuyên mục tổng hợp)
            
            Trường hợp đặc biệt:
            Nếu người dùng nói đọc bài số [số thứ tự], trả về theo dạng "15:[số thứ tự]". Ví dụ: "đọc bài số 3" trả về "15:3", "bài 2, 6" trả về "15:25".
            
            Nếu không trùng khớp với lệnh nào, hoặc người dùng nói quá khác so với lệnh trả về số 11. Chỉ trả về số lệnh, không thêm giải thích.
            `;

            const prompt = `Người dùng nói: "${processedCommand}"\n\nHãy chọn số lệnh phù hợp nhất:`;

            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: functionList
                    },
                    {role: "user", content: prompt}
                ],
                temperature: 0.3,
                max_tokens: 10,
                model: model
            });

            const result = response.choices[0].message.content.trim();
            console.log("API response using token", currentTokenIndex + 1, ":", result);
            return result;

        } catch (error) {
            console.error(`Error with token ${currentTokenIndex + 1}:`, error.message);

            // Move to the next token
            getNextToken();
            attempts++;

            if (attempts >= maxAttempts) {
                console.error("All tokens failed. No more tokens to try.");
                throw new Error("Failed to get response after trying all available tokens");
            }

            console.log(`Switching to token ${currentTokenIndex + 1}. Attempt ${attempts + 1}/${maxAttempts}`);
        }
    }
}