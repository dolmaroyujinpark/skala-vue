import { useState } from 'react';
import { WeatherCard } from './components/WeatherCard';
import { ForecastCard } from './components/ForecastCard';
import { SearchBar } from './components/SearchBar';
import { WeatherDetails } from './components/WeatherDetails';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// Mock weather data
const mockWeatherData = {
  'New York, NY': {
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    feelsLike: 75,
    icon: 'cloud' as const,
    sunrise: '6:24 AM',
    sunset: '7:45 PM',
    pressure: 1013,
    uvIndex: 6,
    airQuality: 'Good',
    precipitation: 20,
  },
  'Los Angeles, CA': {
    temperature: 78,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 5,
    visibility: 12,
    feelsLike: 80,
    icon: 'sun' as const,
    sunrise: '6:05 AM',
    sunset: '7:52 PM',
    pressure: 1018,
    uvIndex: 8,
    airQuality: 'Moderate',
    precipitation: 5,
  },
  'Chicago, IL': {
    temperature: 68,
    condition: 'Light Rain',
    humidity: 78,
    windSpeed: 12,
    visibility: 8,
    feelsLike: 65,
    icon: 'rain' as const,
    sunrise: '6:15 AM',
    sunset: '7:38 PM',
    pressure: 1008,
    uvIndex: 3,
    airQuality: 'Good',
    precipitation: 85,
  },
  'Miami, FL': {
    temperature: 84,
    condition: 'Partly Cloudy',
    humidity: 82,
    windSpeed: 9,
    visibility: 9,
    feelsLike: 89,
    icon: 'cloud' as const,
    sunrise: '6:45 AM',
    sunset: '8:12 PM',
    pressure: 1015,
    uvIndex: 9,
    airQuality: 'Good',
    precipitation: 40,
  },
  'Seattle, WA': {
    temperature: 62,
    condition: 'Cloudy',
    humidity: 88,
    windSpeed: 6,
    visibility: 7,
    feelsLike: 58,
    icon: 'cloud' as const,
    sunrise: '5:58 AM',
    sunset: '8:01 PM',
    pressure: 1005,
    uvIndex: 2,
    airQuality: 'Good',
    precipitation: 65,
  },
  'Austin, TX': {
    temperature: 89,
    condition: 'Sunny',
    humidity: 55,
    windSpeed: 7,
    visibility: 11,
    feelsLike: 94,
    icon: 'sun' as const,
    sunrise: '6:38 AM',
    sunset: '8:18 PM',
    pressure: 1020,
    uvIndex: 10,
    airQuality: 'Moderate',
    precipitation: 10,
  },
};

const mockForecast = [
  { day: 'Today', high: 72, low: 58, condition: 'Partly Cloudy', icon: 'cloud' as const, precipitation: 20 },
  { day: 'Tomorrow', high: 75, low: 61, condition: 'Sunny', icon: 'sun' as const, precipitation: 5 },
  { day: 'Wednesday', high: 69, low: 55, condition: 'Light Rain', icon: 'rain' as const, precipitation: 80 },
  { day: 'Thursday', high: 73, low: 59, condition: 'Partly Cloudy', icon: 'cloud' as const, precipitation: 25 },
  { day: 'Friday', high: 76, low: 62, condition: 'Sunny', icon: 'sun' as const, precipitation: 10 },
];

export default function App() {
  const [currentLocation, setCurrentLocation] = useState('New York, NY');
  
  const currentWeather = mockWeatherData[currentLocation as keyof typeof mockWeatherData] || mockWeatherData['New York, NY'];

  const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1758101662980-31d7b4e5ed99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBza3klMjB3ZWF0aGVyJTIwY2xvdWRzfGVufDF8fHx8MTc1ODk5OTMxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Weather background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-white/90 mb-2">WeatherApp</h1>
            <p className="text-white/70 text-sm">Beautiful weather, beautifully presented</p>
          </div>
          <SearchBar onLocationSelect={handleLocationSelect} />
        </header>

        {/* Main Content */}
        <main className="px-6 pb-6 space-y-6">
          {/* Current Weather */}
          <WeatherCard
            location={currentLocation}
            temperature={currentWeather.temperature}
            condition={currentWeather.condition}
            humidity={currentWeather.humidity}
            windSpeed={currentWeather.windSpeed}
            visibility={currentWeather.visibility}
            feelsLike={currentWeather.feelsLike}
            icon={currentWeather.icon}
          />

          {/* Forecast and Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ForecastCard forecast={mockForecast} />
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-white/90 mb-4">Today's Highlights</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">UV Index</span>
                    <span className="text-white">{currentWeather.uvIndex}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Air Quality</span>
                    <span className="text-white">{currentWeather.airQuality}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Sunrise</span>
                    <span className="text-white">{currentWeather.sunrise}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Sunset</span>
                    <span className="text-white">{currentWeather.sunset}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <WeatherDetails
            sunrise={currentWeather.sunrise}
            sunset={currentWeather.sunset}
            pressure={currentWeather.pressure}
            uvIndex={currentWeather.uvIndex}
            airQuality={currentWeather.airQuality}
            precipitation={currentWeather.precipitation}
          />
        </main>
      </div>
    </div>
  );
}