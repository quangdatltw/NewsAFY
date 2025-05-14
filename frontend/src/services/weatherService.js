export const fetchWeatherData = async () => {
    try {
        const response = await fetch('http://localhost:3000/weather');
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};