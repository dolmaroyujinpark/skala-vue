import { Sunrise, Sunset, Gauge, Compass, CloudRain, Zap } from 'lucide-react';
import { Card } from './ui/card';

interface WeatherDetailsProps {
  sunrise: string;
  sunset: string;
  pressure: number;
  uvIndex: number;
  airQuality: string;
  precipitation: number;
}

export function WeatherDetails({ 
  sunrise, 
  sunset, 
  pressure, 
  uvIndex, 
  airQuality, 
  precipitation 
}: WeatherDetailsProps) {
  const getUVColor = (uv: number) => {
    if (uv <= 2) return 'text-green-500';
    if (uv <= 5) return 'text-yellow-500';
    if (uv <= 7) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAQColor = (aq: string) => {
    switch (aq.toLowerCase()) {
      case 'good': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      default: return 'text-red-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3">
          <Sunrise className="w-8 h-8 text-orange-400" />
          <div>
            <p className="text-sm text-muted-foreground">Sunrise</p>
            <p className="text-lg">{sunrise}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3">
          <Sunset className="w-8 h-8 text-orange-600" />
          <div>
            <p className="text-sm text-muted-foreground">Sunset</p>
            <p className="text-lg">{sunset}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3">
          <Gauge className="w-8 h-8 text-blue-400" />
          <div>
            <p className="text-sm text-muted-foreground">Pressure</p>
            <p className="text-lg">{pressure} hPa</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3">
          <Zap className={`w-8 h-8 ${getUVColor(uvIndex)}`} />
          <div>
            <p className="text-sm text-muted-foreground">UV Index</p>
            <p className="text-lg">{uvIndex}/10</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3">
          <Compass className={`w-8 h-8 ${getAQColor(airQuality)}`} />
          <div>
            <p className="text-sm text-muted-foreground">Air Quality</p>
            <p className="text-lg">{airQuality}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-3">
          <CloudRain className="w-8 h-8 text-blue-300" />
          <div>
            <p className="text-sm text-muted-foreground">Precipitation</p>
            <p className="text-lg">{precipitation}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}