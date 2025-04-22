import OpenAI from "openai";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1-nano";
const token = import.meta.env.VITE_GITHUB_TOKEN;

export async function commandSelector(command) {

    const client = new OpenAI({baseURL: endpoint, apiKey: token, dangerouslyAllowBrowser: true});
    const functionList = `
    Respond only with the most appropriate function name from the provided list, based strictly on the requirements of the Vietnamese natural language input.
    
    Danh sách lệnh điều khiển ứng dụng đọc báo:
    
    1. "đọc tin tức": Đọc tiêu đề và mô tả của các tin tức hiện tại, ưu tiên nếu lệnh không rõ ràng là đọc gì
    3. "tin tiếp theo": Chuyển sang tin tức tiếp theo
    4. "tin trước đó": Quay lại tin tức trước đó
    5. "đọc tin công nghệ": Lọc và đọc các tin tức về công nghệ
    6. "đọc tin sức khỏe": Lọc và đọc các tin tức về sức khỏe
    7. "đọc tin thế giới": Lọc và đọc các tin tức thế giới
    8. "đọc tin khoa học": Lọc và đọc các tin tức khoa học
    9. "dừng đọc": Dừng việc đọc tin tức hiện tại
    10. "tiếp tục đọc": Tiếp tục đọc tin tức từ vị trí đã dừng
    11. "tóm tắt tin": Cung cấp bản tóm tắt ngắn gọn của tin tức đang chọn
    12. "đọc chậm hơn": Giảm tốc độ đọc
    13. "đọc nhanh hơn": Tăng tốc độ đọc
    14. "tìm kiếm [từ khóa]": Tìm kiếm tin tức với từ khóa được chỉ định, trả lời bao gồm từ khoá đó thay vào []
    15. "lưu tin này": Lưu tin tức hiện tại để đọc sau
    
    Tự động sửa các từ học, mọc, cọc, etc... thành từ "đọc".
    `;
    const suggestion = 'Gợi ý: nếu đọc tin + x, x không có trong danh sách lệnh, rất có thể là đang tìm kiếm từ khoá. ';
    const prompt = functionList + '\n \n' + 'Người dùng nói: ' + command + '\n' + suggestion;


    const response = await client.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "Respond only with the most appropriate function name from the provided list, based strictly on the requirements of the Vietnamese natural language input."
            },
            {role: "user", content: prompt}
        ],
        temperature: 1,
        top_p: 1,
        model: model
    });

    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}

commandSelector().catch((err) => {
    console.error("The sample encountered an error:", err);
});
