// Map handling with Leaflet

let map = null;
let markers = [];

export function initializeMap(userLocation, culturalActivities, CONFIG) {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  const centerLat = userLocation ? userLocation.lat : 40.7128;
  const centerLng = userLocation ? userLocation.lng : -74.0060;

  if (map) {
    map.remove();
  }

  map = L.map('map-container').setView([centerLat, centerLng], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  if (userLocation) {
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({
        html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="color: white; font-size: 10px;"></i></div>`,
        iconSize: [24, 24],
        className: 'user-location-marker'
      })
    }).addTo(map);

    userMarker.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg">Your Location</h3>
        <p class="text-gray-600">You are here</p>
      </div>
    `);
  }

  markers = [];
  culturalActivities.forEach(activity => {
    const categoryConfig = CONFIG.categories[activity.type] || CONFIG.categories.local;
    const markerColor = categoryConfig.color;

    const marker = L.marker([activity.lat, activity.lng], {
      icon: L.divIcon({
        html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        className: 'custom-marker'
      })
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg">${activity.name}</h3>
        <p class="text-gray-600">${activity.description}</p>
        ${activity.distance ? `<p class="text-sm text-gray-500">Distance: ${activity.distance}</p>` : ''}
        ${activity.rating ? `<p class="text-sm text-yellow-600">Rating: ${activity.rating}★</p>` : ''}
        <button onclick="askAIGuide('Tell me more about ${activity.name}')" class="mt-2 text-primary hover:text-blue-700 text-sm font-medium">Ask AI Guide</button>
        <button onclick="getDirections(${activity.lat}, ${activity.lng}, '${activity.name}')" class="mt-1 ml-2 text-green-600 hover:text-green-700 text-sm font-medium">Get Directions</button>
      </div>
    `);

    markers.push({ id: activity.id, marker: marker, lat: activity.lat, lng: activity.lng });
  });
}

export function focusOnMapMarker(markerId) {
  const markerData = markers.find(m => m.id === markerId);
  if (markerData && map) {
    map.setView([markerData.lat, markerData.lng], 16);
    markerData.marker.openPopup();
  }
}

export function getDirections(userLocation, lat, lng) {
  if (userLocation) {
    const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  } else {
    alert('Location access is required for directions. Please enable location services.');
  }
}
