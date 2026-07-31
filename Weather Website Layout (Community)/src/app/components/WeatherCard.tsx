import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer } from 'lucide-react';
import { Card } from './ui/card';

interface WeatherCardProps {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
  icon: 'sun' | 'cloud' | 'rain';
}

const weatherIcons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
};

export function WeatherCard({ 
  location, 
  temperature, 
  condition, 
  humidity, 
  windSpeed, 
  visibility, 
  feelsLike, 
  icon 
}: WeatherCardProps) {
  const IconComponent = weatherIcons[icon];

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-400/20 to-purple-600/20 backdrop-blur-sm border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl mb-2">{location}</h2>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <IconComponent className="w-16 h-16 text-yellow-400" />
      </div>
      
      <div className="flex items-center mb-8">
        <span className="text-6xl mr-4">{temperature}°</span>
        <div>
          <p className="text-xl">{condition}</p>
          <p className="text-muted-foreground">Feels like {feelsLike}°</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-sm text-muted-foreground">Humidity</p>
            <p>{humidity}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-muted-foreground">Wind</p>
            <p>{windSpeed} mph</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm text-muted-foreground">Visibility</p>
            <p>{visibility} mi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm text-muted-foreground">Feels like</p>
            <p>{feelsLike}°</p>
          </div>
        </div>
      </div>
    </Card>
  );
}