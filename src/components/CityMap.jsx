import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CityMap = ({ cities }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const cityCoordinates = {
    Mumbai: [19.0760, 72.8777],
    Delhi: [28.7041, 77.1025],
    Bangalore: [12.9716, 77.5946],
    Chennai: [13.0827, 80.2707]
  };

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }

    const map = mapRef.current;
    if (map) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const uniqueCities = [...new Set(cities || ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'])];
      
      uniqueCities.forEach(cityName => {
        const coords = cityCoordinates[cityName];
        if (coords) {
          L.marker(coords)
            .addTo(map)
            .bindPopup(`City: ${cityName}`)
            .openPopup();
        }
      });
    }

    return () => {
    };
  }, [cities]);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-xl z-0"
      />
    </div>
  );
};

export default CityMap;
