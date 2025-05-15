export const analyzeWeatherData = async (weatherData) => {
    try {
        if (!weatherData || !weatherData.current || !weatherData.location) {
            return "Không thể phân tích dữ liệu thời tiết. Dữ liệu không đầy đủ.";
        }


        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_TOKEN;
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
        weatherData.current.air_quality.pm2_5 = Math.round(weatherData.current.air_quality.pm2_5);

        const simplifiedData = {
            location: {
                name: weatherData.location.name,
                region: weatherData.location.region,
                country: weatherData.location.country,
                localtime: weatherData.location.localtime
            },
            current: {
                temp_c: weatherData.current.temp_c,
                feelslike_c: weatherData.current.feelslike_c,
                condition: weatherData.current.condition,
                humidity: weatherData.current.humidity,
                wind_kph: weatherData.current.wind_kph,
                wind_dir: weatherData.current.wind_dir,
                last_updated: weatherData.current.last_updated,
                air_quality: weatherData.current.air_quality
            }
        };
        console.log(simplifiedData);



        const prompt = `
      Dưới đây là dữ liệu thời tiết chi tiết:
      ${JSON.stringify(simplifiedData, null, 2)}
      
      Diễn giải thông tin thời tiết này chỉ bằng tiếng Việt, với văn phong tự nhiên như một người dẫn chương trình thời tiết. Không dùng câu cảm thán.
      Tóm tắt cần ngắn gọn, dễ hiểu, rõ ràng không quá 8-10 câu.
      Nhất định phải bao gồm: tên địa điểm, nhiệt độ (không nói cảm giác nhiệt độ), độ ẩm, hướng gió, tình trạng thời tiết.
      Nếu có thông tin về chất lượng không khí, chỉ số bụi mịn thì cũng đề cập. Và giải thích rõ ràng về chỉ số chất lượng không khí (AQI) như tốt, trung bình, không tốt cho người nhạy cảm, có hại, rất có hại, nguy hiểm.
      Cuối cùng thêm thời gian cập nhật.
      Phải viết bằng tiếng Việt, từ ngữ thân thiện, và đầy đủ dấu câu.
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

        // Extract the text from response
        let responseText;
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            responseText = data.candidates[0].content.parts[0].text;
        } else if (data.content?.parts?.[0]?.text) {
            responseText = data.content.parts[0].text;
        } else {
            throw new Error("Unexpected API response structure");
        }

        return responseText.trim();
    } catch (error) {
        console.error("Error analyzing weather data with Gemini:", error);

        // Fallback to simple template if Gemini fails
        try {
            const {location, current} = weatherData;
            let summary = `Thời tiết tại ${location.name}, ${location.country}. `;
            summary += `Nhiệt độ hiện tại là ${current.temp_c}°C, cảm giác như ${current.feelslike_c}°C. `;
            summary += `Trời ${vietnameseWeatherCondition(current.condition.text)}. `;
            summary += `Cập nhật lúc ${current.last_updated}.`;

            return summary;
        } catch (fallbackError) {
            return "Đã xảy ra lỗi khi phân tích dữ liệu thời tiết.";
        }
    }
};

export const analyzeGoldPriceData = async (goldData) => {
    try {
        if (!goldData || !goldData.DataList || !goldData.DataList.Data) {
            return "Không thể phân tích dữ liệu giá vàng. Dữ liệu không đầy đủ.";
        }

        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_TOKEN;
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

        const recentGoldData = goldData.DataList.Data.slice(0, 7).map(item => {
            const rowNum = item["@row"];

            return {
                name: item[`@n_${rowNum}`],
                karat: item[`@k_${rowNum}`],
                purity: item[`@h_${rowNum}`],
                buyPrice: parseInt(item[`@pb_${rowNum}`]),
                sellPrice: parseInt(item[`@ps_${rowNum}`]),
                updateTime: item[`@d_${rowNum}`]
            };
        });

        // Prepare data for the prompt
        const goldPriceData = {
            allPrices: recentGoldData,
            updateTime: recentGoldData[0]?.updateTime || "không rõ"
        };

        const prompt = `
      Dưới đây là dữ liệu giá vàng chi tiết của nhiều loại vàng khác nhau:
      ${JSON.stringify(goldPriceData, null, 2)}

      Hãy tóm tắt thông tin giá vàng này bằng tiếng Việt, với văn phong tự nhiên như người đưa tin tài chính.
      Tóm tắt cần ngắn gọn, dễ hiểu, đầy đủ, rõ ràng không quá 8-10 câu.
      Nhất định phải bao gồm: 
      - Giá mua và bán của các loại vàng chính
      - So sánh giữa các loại vàng khác nhau
      - Thời gian cập nhật
      - Nhận xét về mức giá hiện tại

      Phải viết bằng tiếng Việt, từ ngữ thân thiện, đầy đủ dấu câu, và dễ hiểu cho người nghe.
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

        // Extract the text from response
        let responseText;
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            responseText = data.candidates[0].content.parts[0].text;
        } else if (data.content?.parts?.[0]?.text) {
            responseText = data.content.parts[0].text;
        } else {
            throw new Error("Unexpected API response structure");
        }

        return responseText.trim();
    } catch (error) {
        console.error("Error analyzing gold price data with Gemini:", error);

        // Fallback to simple template if Gemini fails
        try {
            // Find SJC gold data
            const sjcGold = goldData.DataList.Data.find(item =>
                item[`@n_${item["@row"]}`]?.includes("VÀNG MIẾNG SJC"));

            // Find BTMC gold data
            const btmcGold = goldData.DataList.Data.find(item =>
                item[`@n_${item["@row"]}`]?.includes("TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 99.9"));

            // Find VRTL gold data
            const vrtlGold = goldData.DataList.Data.find(item =>
                item[`@n_${item["@row"]}`]?.includes("VÀNG MIẾNG VRTL"));

            let summary = `Thông tin giá vàng mới nhất. `;

            if (sjcGold) {
                const rowNum = sjcGold["@row"];
                const buyPrice = parseInt(sjcGold[`@pb_${rowNum}`]).toLocaleString();
                const sellPrice = parseInt(sjcGold[`@ps_${rowNum}`]).toLocaleString();
                summary += `Vàng SJC: mua vào ${buyPrice} đồng, bán ra ${sellPrice} đồng. `;
            }

            if (btmcGold) {
                const rowNum = btmcGold["@row"];
                const buyPrice = parseInt(btmcGold[`@pb_${rowNum}`]).toLocaleString();
                const sellPrice = parseInt(btmcGold[`@ps_${rowNum}`]).toLocaleString();
                summary += `Vàng BTMC: mua vào ${buyPrice} đồng, bán ra ${sellPrice} đồng. `;
            }

            if (vrtlGold) {
                const rowNum = vrtlGold["@row"];
                const buyPrice = parseInt(vrtlGold[`@pb_${rowNum}`]).toLocaleString();
                const sellPrice = parseInt(vrtlGold[`@ps_${rowNum}`]).toLocaleString();
                summary += `Vàng Rồng Thăng Long: mua vào ${buyPrice} đồng, bán ra ${sellPrice} đồng. `;
            }

            // Add update time from the first available data
            const updateTime = goldData.DataList.Data[0][`@d_${goldData.DataList.Data[0]["@row"]}`];
            summary += `Cập nhật lúc ${updateTime}.`;

            return summary;
        } catch (fallbackError) {
            return "Đã xảy ra lỗi khi phân tích dữ liệu giá vàng.";
        }
    }
};

// Helper function to translate weather conditions to Vietnamese
export default function vietnameseWeatherCondition(englishCondition) {
    const conditionMap = {
        "Sunny": "Nắng",
        "Clear": "Quang đãng",
        "Partly cloudy": "Có mây rải rác",
        "Patchy rain nearby": "Mưa nhỏ rải rác",
        "Moderate or heavy rain shower": "Vài nơi có mưa vừa",
        "Light rain shower": "Mưa nhẹ có nắng",
        "Cloudy": "Nhiều mây",
        "Overcast": "U ám",
        "Mist": "Sương mù nhẹ",
        "Fog": "Sương mù dày đặc",
        "Light rain": "Mưa nhẹ",
        "Moderate rain": "Mưa vừa",
        "Heavy rain": "Mưa to",
        "Light snow": "Tuyết nhẹ",
        "Moderate snow": "Tuyết vừa",
        "Heavy snow": "Tuyết dày",
        "Thunderstorm": "Có dông"
    };

    return conditionMap[englishCondition] || englishCondition;
}

// Helper function to describe air quality index
