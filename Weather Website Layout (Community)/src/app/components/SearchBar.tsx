import { Search, MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useState } from 'react';

interface SearchBarProps {
  onLocationSelect: (location: string) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Miami, FL',
    'Seattle, WA',
    'Austin, TX'
  ];

  const handleSearch = (location: string) => {
    onLocationSelect(location);
    setSearchValue(location);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a city..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(searchValue.length > 0)}
          className="pl-10 pr-12 bg-white/20 backdrop-blur-sm border-white/30 placeholder:text-white/70"
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/20"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {showSuggestions && (
        <Card className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-sm border-white/30 p-2 z-10">
          <div className="space-y-1">
            {popularLocations
              .filter(location => 
                location.toLowerCase().includes(searchValue.toLowerCase())
              )
              .slice(0, 4)
              .map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(location)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 text-gray-800"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {location}
                </button>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}