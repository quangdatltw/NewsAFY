import {useEffect, useState} from "react";
import {fetchWeatherData} from "../services/weatherService";
import vietnameseWeatherCondition from "../services/analyzeApiService";

function WeatherDisplay() {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const getWeatherData = async () => {
            try {
                setLoading(true);
                const data = await fetchWeatherData();
                setWeatherData(data);
                setWeather(vietnameseWeatherCondition(data.current.condition.text));
                console.log(weather);
            } catch (err) {
                setError("Không thể tải dữ liệu thời tiết");
            } finally {
                setLoading(false);
            }
        };

        getWeatherData();
    }, []);

    if (loading) return <div className="weather-loading">Đang tải dữ liệu thời tiết...</div>;
    if (error) return <div className="weather-error">{error}</div>;
    if (!weatherData) return null;

    return (
        <div className="weather-display">
            <h3>Thời tiết</h3>
            <div className="weather-content">
                {weatherData.location && (
                    <p className="weather-location">{weatherData.location.name}</p>
                )}
                {weatherData.current && (
                    <>
                        <div className="weather-icon-temp">
                            {weatherData.current.condition.icon && (
                                <img
                                    src={`https:${weatherData.current.condition.icon}`}
                                    alt={weatherData.current.condition.text}
                                    className="weather-icon"
                                />
                            )}
                            <p className="weather-temp">{weatherData.current.temp_c}°C</p>
                        </div>
                        <p className="weather-desc">{weather}</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default WeatherDisplay;