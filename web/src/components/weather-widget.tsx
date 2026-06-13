'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const citiesCoordinates = [
  { name: 'البيضاء', lat: 32.7627, lon: 21.7551 },
  { name: 'الكفرة', lat: 24.2167, lon: 23.3167 },
  { name: 'مصراتة', lat: 32.3754, lon: 15.0925 },
  { name: 'سبها', lat: 27.0377, lon: 14.4283 },
  { name: 'طرابلس', lat: 32.8752, lon: 13.1875 },
  { name: 'بنغازي', lat: 32.1167, lon: 20.0667 }, // Benghazi is the main city
];

// Helper to convert WMO Weather code to emoji
function getWeatherEmoji(code: number) {
  if (code === 0) return '☀️'; // Clear sky
  if (code === 1 || code === 2) return '⛅'; // Partly cloudy
  if (code === 3) return '☁️'; // Overcast
  if (code >= 45 && code <= 48) return '🌫️'; // Fog
  if (code >= 51 && code <= 67) return '🌧️'; // Rain
  if (code >= 71 && code <= 77) return '❄️'; // Snow
  if (code >= 80 && code <= 82) return '🌦️'; // Rain showers
  if (code >= 95 && code <= 99) return '⛈️'; // Thunderstorm
  return '☀️'; // Default
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '/');

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Open-Meteo is completely free and requires no API key!
        const lats = citiesCoordinates.map(c => c.lat).join(',');
        const lons = citiesCoordinates.map(c => c.lon).join(',');
        
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=Africa%2FTripoli`);
        const data = await res.json();
        
        // Data returns an array matching our coordinates order
        if (data && Array.isArray(data)) {
          const formattedData = citiesCoordinates.map((city, index) => {
            const cityWeather = data[index];
            return {
              name: city.name,
              current: Math.round(cityWeather.current_weather.temperature),
              high: Math.round(cityWeather.daily.temperature_2m_max[0]),
              low: Math.round(cityWeather.daily.temperature_2m_min[0]),
              code: cityWeather.current_weather.weathercode,
              icon: getWeatherEmoji(cityWeather.current_weather.weathercode)
            };
          });
          setWeatherData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  // Use dummy data while loading or if it fails
  const displayData = weatherData || citiesCoordinates.map(c => ({ name: c.name, current: 29, high: 30, low: 20, icon: '☀️' }));
  const mainCity = displayData.find((c: any) => c.name === 'بنغازي') || displayData[displayData.length - 1];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-gradient-to-b from-[#163a6e] to-[#0d1f3b] text-white" dir="rtl">
      {/* Background Texture/Map pattern (mimicking the uploaded design) */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
      
      {/* Top section */}
      <div className="relative z-10 p-4 md:p-6 pb-2">
        {/* Date box */}
        <div className="absolute top-4 left-4 bg-[#0a1526]/60 text-white font-mono px-3 py-1.5 text-xs tracking-[0.2em] rounded shadow-lg border border-white/5">
          {currentDate}
        </div>
        
        {/* Main City */}
        <div className="flex justify-between items-start mt-6">
          <div className="flex-1 text-center md:text-right pr-2">
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2 mr-2 tracking-tighter">{mainCity.name}</h2>
            <div className="flex items-start justify-center md:justify-start gap-1">
              <span className="text-7xl md:text-8xl font-black leading-none drop-shadow-2xl">
                {loading ? '--' : mainCity.current}
              </span>
              <span className="text-2xl font-black text-orange-400 mt-2">o</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end pl-2 md:pl-6 pt-2">
             <div className="text-[90px] leading-none drop-shadow-2xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
               {loading ? '☀️' : mainCity.icon}
             </div>
          </div>
        </div>
      </div>

      {/* Grid of Cities */}
      <div className="relative z-10 px-4 pb-4 mt-2">
        <div className="flex flex-row-reverse justify-between items-stretch gap-1">
          {displayData.map((city: any, idx: number) => (
            <div key={idx} className="flex-1 flex flex-col rounded-lg overflow-hidden border border-white/10 shadow-lg text-center backdrop-blur-sm">
              <div className="bg-white/10 py-1.5 border-b border-white/5">
                <h4 className="text-[11px] font-black text-white drop-shadow tracking-tighter">{city.name}</h4>
              </div>
              <div className="bg-white/5 py-2 flex flex-col items-center gap-1.5">
                <span className="text-sm drop-shadow-lg">{loading ? '⌛' : city.icon}</span>
                <span className="text-lg font-black text-white drop-shadow">{loading ? '-' : city.high}</span>
                <span className="text-[10px] opacity-70">☁️</span>
                <span className="text-xs font-bold text-white/80 drop-shadow">{loading ? '-' : city.low}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Socials */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-[#0a1526]/40 border-t border-white/5">
         <div className="w-8 h-10 relative opacity-90">
           <Image src="/logo.png" alt="AlMada" fill className="object-contain" />
         </div>
         <div className="flex items-center text-white/70">
           <span className="text-xs font-semibold tracking-widest mr-2 text-white/90">AlMada</span>
         </div>
      </div>
    </div>
  );
}
