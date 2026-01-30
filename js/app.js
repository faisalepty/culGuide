// App bootstrap and page logic

import { defaultActivities, simulateNearbyActivitiesAPI } from './data.js';
import { initializeMap, focusOnMapMarker, getDirections as mapGetDirections } from './map.js';
import { sendAIMessage, handleAIKeyPress, askAIGuide } from './chat.js';

// Expose some functions for inline onclick handlers used in HTML
window.askAIGuide = askAIGuide;
window.sendAIMessage = sendAIMessage;
window.handleAIKeyPress = handleAIKeyPress;
window.focusOnMapMarker = focusOnMapMarker;
window.getDirections = (lat, lng, name) => mapGetDirections(window.userLocation, lat, lng, name);

window.userLocation = null;
window.culturalActivities = [];

// Section navigation
window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    targetSection.classList.add('active');

    if (sectionId === 'map') {
      setTimeout(() => {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
          // Leaflet will handle invalidateSize when re-created; ensure map exists
        }
      }, 100);
    }
  }

  document.querySelectorAll('header nav a').forEach(link => {
  link.classList.remove('text-primary', 'font-bold');
  link.classList.add('text-dark');
  });
  
  const activeLink = document.querySelector(`header nav a[onclick="showSection('${sectionId}')"]`);
  if (activeLink) {
  activeLink.classList.remove('text-dark');
  activeLink.classList.add('text-primary', 'font-bold');
  }
}

function showLocationStatus(detected) {
  const statusElement = document.getElementById('location-status');
  if (!statusElement) return;
  if (detected) {
    statusElement.classList.remove('hidden');
    statusElement.classList.add('flex');
  } else {
    statusElement.innerHTML = `
      <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <span class="text-gray-600">Using default location</span>
    `;
    statusElement.classList.remove('hidden');
    statusElement.classList.add('flex');
  }
}

async function fetchNearbyActivities(lat, lng) {
  try {
    const nearbyActivities = await simulateNearbyActivitiesAPI(lat, lng);
    window.culturalActivities = nearbyActivities;
    initializeMap(window.userLocation, window.culturalActivities, window.CONFIG || CONFIG);
  } catch (e) {
    window.culturalActivities = defaultActivities;
    initializeMap(window.userLocation, window.culturalActivities, window.CONFIG || CONFIG);
  }
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    showLocationStatus(false);
    window.userLocation = { lat: 40.7128, lng: -74.0060 };
    window.culturalActivities = defaultActivities;
    initializeMap(window.userLocation, window.culturalActivities, window.CONFIG || CONFIG);
    return;
  }

  const statusElement = document.getElementById('location-status');
  if (statusElement) {
    statusElement.innerHTML = `
      <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <span class="text-gray-600">Getting location...</span>
    `;
    statusElement.classList.remove('hidden');
    statusElement.classList.add('flex');
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      window.userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      showLocationStatus(true);
      fetchNearbyActivities(window.userLocation.lat, window.userLocation.lng);
    },
    (error) => {
      const statusElement = document.getElementById('location-status');
      if (statusElement) {
        let errorMsg = 'Location unavailable';
        switch (error.code) {
          case error.PERMISSION_DENIED: errorMsg = 'Location access denied'; break;
          case error.POSITION_UNAVAILABLE: errorMsg = 'Location unavailable'; break;
          case error.TIMEOUT: errorMsg = 'Location timeout'; break;
        }
        statusElement.innerHTML = `
          <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          <span class="text-gray-600">${errorMsg}</span>
          <button onclick="(${getCurrentLocation.toString()})()" class="ml-2 text-blue-600 text-xs underline">Retry</button>
        `;
      }
      window.userLocation = { lat: 40.7128, lng: -74.0060 };
      window.culturalActivities = defaultActivities;
      initializeMap(window.userLocation, window.culturalActivities, window.CONFIG || CONFIG);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

function init() {
  getCurrentLocation();
  // Ensure header nav clicks always route properly and update active state
  document.querySelectorAll('header nav a[onclick^="showSection"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const m = a.getAttribute('onclick').match(/showSection\('([^']+)'\)/);
      if (m) window.showSection(m[1]);
    });
  });
  window.showSection('home');
}

document.addEventListener('DOMContentLoaded', init);
