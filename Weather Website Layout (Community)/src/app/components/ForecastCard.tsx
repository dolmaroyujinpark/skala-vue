import { Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';
import { Card } from './ui/card';

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'snow';
  precipitation: number;
}

interface ForecastCardProps {
  forecast: ForecastDay[];
}

const weatherIcons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
};

export function ForecastCard({ forecast }: ForecastCardProps) {
  return (
    <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <h3 className="mb-6">5-Day Forecast</h3>
      
      <div className="space-y-4">
        {forecast.map((day, index) => {
          const IconComponent = weatherIcons[day.icon];
          
          return (
            <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
              <div className="flex items-center gap-4 flex-1">
                <p className="w-20">{day.day}</p>
                <IconComponent className="w-6 h-6 text-blue-300" />
                <p className="text-sm text-muted-foreground flex-1">{day.condition}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-blue-300">
                  {day.precipitation}%
                </div>
                <div className="flex items-center gap-2 min-w-[60px] justify-end">
                  <span className="text-muted-foreground">{day.low}°</span>
                  <span>{day.high}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}