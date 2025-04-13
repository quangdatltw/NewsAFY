// You'll need to get an API key from NewsAPI.org or a similar service
const API_KEY = import.meta.env.VITE_NEWS_API_KEY || "YOUR_API_KEY"
const BASE_URL = "https://newsapi.org/v2"

export const fetchNews = async (category = "general") => {
    try {
        // If you don't have an API key, use the sample data for development
        if (API_KEY === "YOUR_API_KEY") {
            return sampleNewsData
        }

        // Try to get Vietnamese news if available, otherwise fall back to US news
        const response = await fetch(`${BASE_URL}/top-headlines?country=vn&category=${category}&apiKey=${API_KEY}`)

        if (!response.ok) {
            throw new Error(`Không thể tải tin tức: ${response.status}`)
        }

        const data = await response.json()
        return data.articles
    } catch (error) {
        console.error("Lỗi khi tải tin tức:", error)
        // Return sample data as fallback
        return sampleNewsData
    }
}

// Sample data for development or when API is not available (in Vietnamese)
const sampleNewsData = [
    {
        title: "Các nhà khoa học phát hiện loài mới tại rừng Amazon",
        description:
            "Các nhà nghiên cứu đã xác định một loài ếch trước đây chưa từng biết đến với khả năng thích nghi đáng kinh ngạc.",
        content:
            "Một nhóm các nhà khoa học quốc tế đã phát hiện ra một loài ếch cây mới trong rừng Amazon. Loài này, có tên là Hyla amazonica, có những đặc điểm thích nghi độc đáo cho phép nó thay đổi màu sắc dựa trên điều kiện môi trường.",
        url: "https://example.com/news/science/new-species",
        urlToImage: "https://via.placeholder.com/600x400?text=Rừng+Amazon",
        publishedAt: "2023-04-15T08:30:00Z",
        source: {
            name: "Khoa Học Hàng Ngày",
        },
    },
    {
        title: "Hội nghị công nghệ toàn cầu công bố các công cụ AI cách mạng",
        description: "Hội nghị thường niên TechWorld đã giới thiệu một số ứng dụng trí tuệ nhân tạo đột phá.",
        content:
            "Tại hội nghị TechWorld năm nay, các công ty công nghệ lớn đã giới thiệu các công cụ AI mới được thiết kế để chuyển đổi các ngành từ chăm sóc sức khỏe đến giao thông vận tải. Thông báo đáng chú ý nhất là hệ thống AI có khả năng dự đoán điểm yếu cấu trúc trong các tòa nhà với độ chính xác 99%.",
        url: "https://example.com/news/technology/ai-tools",
        urlToImage: "https://via.placeholder.com/600x400?text=Hội+Nghị+Công+Nghệ",
        publishedAt: "2023-04-14T14:15:00Z",
        source: {
            name: "Công Nghệ Insider",
        },
    },
    {
        title: "Nghiên cứu mới liên kết tập thể dục với cải thiện sức khỏe tâm thần",
        description:
            "Nghiên cứu xác nhận rằng hoạt động thể chất thường xuyên làm giảm đáng kể các triệu chứng lo âu và trầm cảm.",
        content:
            "Một nghiên cứu toàn diện với hơn 10.000 người tham gia đã phát hiện ra rằng chỉ cần 30 phút tập thể dục vừa phải ba lần một tuần có thể giảm các triệu chứng trầm cảm lên đến 40%. Nghiên cứu được thực hiện trong năm năm cũng ghi nhận cải thiện chất lượng giấc ngủ và sự hài lòng với cuộc sống nói chung.",
        url: "https://example.com/news/health/exercise-mental-health",
        urlToImage: "https://via.placeholder.com/600x400?text=Tập+Thể+Dục+Và+Sức+Khỏe",
        publishedAt: "2023-04-13T09:45:00Z",
        source: {
            name: "Tạp Chí Sức Khỏe",
        },
    },
    {
        title: "Thỏa thuận hòa bình lịch sử được ký kết ở Trung Đông",
        description: "Sau nhiều thập kỷ xung đột, hai quốc gia láng giềng đã đồng ý một hiệp ước hòa bình toàn diện.",
        content:
            'Trong một thành tựu ngoại giao đáng chú ý, đại diện từ cả hai quốc gia đã ký một hiệp ước hòa bình giải quyết các tranh chấp lãnh thổ, chia sẻ tài nguyên và hợp tác an ninh. Các quan sát viên quốc tế đã gọi thỏa thuận này là "một mô hình cho việc giải quyết xung đột trong khu vực."',
        url: "https://example.com/news/world/peace-agreement",
        urlToImage: "https://via.placeholder.com/600x400?text=Ký+Kết+Thỏa+Thuận+Hòa+Bình",
        publishedAt: "2023-04-12T16:20:00Z",
        source: {
            name: "Mạng Tin Tức Thế Giới",
        },
    },
    {
        title: "Đột phá lớn trong lưu trữ năng lượng tái tạo",
        description: "Các kỹ sư phát triển công nghệ pin mới có thể giải quyết vấn đề gián đoạn của năng lượng tái tạo.",
        content:
            "Các nhà khoa học đã tạo ra một loại pin lưới điện mới có thể lưu trữ năng lượng tái tạo trong nhiều tháng với mức tổn thất tối thiểu. Công nghệ này có thể biến năng lượng mặt trời và gió thành nguồn năng lượng đáng tin cậy quanh năm, có khả năng đẩy nhanh quá trình chuyển đổi từ nhiên liệu hóa thạch.",
        url: "https://example.com/news/science/energy-storage",
        urlToImage: "https://via.placeholder.com/600x400?text=Năng+Lượng+Tái+Tạo",
        publishedAt: "2023-04-11T11:10:00Z",
        source: {
            name: "Năng Lượng Tương Lai",
        },
    },
]
