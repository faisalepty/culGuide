import { useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface MapSectionProps {
  culturalActivities: any[]
  userLocation: { lat: number; lng: number } | null
}

export default function MapSection({ culturalActivities, userLocation }: MapSectionProps) {
  const [fullScreen, setFullScreen] = useState(false)

  const centerLat = userLocation ? userLocation.lat : 40.7128
  const centerLng = userLocation ? userLocation.lng : -74.0060

  const getDirections = (lat: number, lng: number) => {
    if (userLocation) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`
      window.open(googleMapsUrl, '_blank')
    } else {
      alert('Location access is required for directions. Please enable location services.')
    }
  }

  const MapContent = (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">Your Location</h3>
              <p className="text-gray-600">You are here</p>
            </div>
          </Popup>
        </Marker>
      )}

      {culturalActivities.map((activity) => (
        <Marker key={activity.id} position={[activity.lat, activity.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{activity.name}</h3>
              <p className="text-gray-600">{activity.description}</p>
              {activity.distance && <p className="text-sm text-gray-500">Distance: {activity.distance}</p>}
              {activity.rating && <p className="text-sm text-yellow-600">Rating: {activity.rating}★</p>}
              <button 
                onClick={() => getDirections(activity.lat, activity.lng)}
                className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Get Directions
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-dark">Interactive Cultural Map</h2>
          <p className="text-lg text-gray-600 max-w-3xl">Explore cultural sites, museums, historical landmarks, and local experiences. Click on markers for details and directions.</p>
        </div>
        <button
          onClick={() => setFullScreen(true)}
          className="hidden md:inline-flex items-center gap-2 bg-dark text-white px-4 py-2 rounded-lg hover:bg-black/80"
        >
          <i className="fas fa-expand"></i>
          Full screen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="w-full h-[70vh]">
              {MapContent}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
            <h3 className="text-xl font-bold text-dark mb-6">Cultural Points of Interest</h3>

            <div className="space-y-4">
              {culturalActivities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-landmark text-primary"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-dark">{activity.name}</h4>
                    <p className="text-sm text-gray-600">{activity.distance ?? ''} {activity.rating ? `• ${activity.rating}★` : ''}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-bold text-dark mb-3">Map Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-700">Museums & Galleries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-secondary rounded-full"></div>
                  <span className="text-sm text-gray-700">Cultural Performances</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-accent rounded-full"></div>
                  <span className="text-sm text-gray-700">Local Experiences</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullScreen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 right-4 z-[60] flex gap-2">
            <button
              onClick={() => setFullScreen(false)}
              className="inline-flex items-center gap-2 bg-dark text-white px-3 py-2 rounded-lg hover:bg-black/80 shadow"
            >
              <i className="fas fa-compress"></i>
              Exit full screen
            </button>
          </div>
          <div className="w-full h-full">
            {MapContent}
          </div>
        </div>
      )}
    </section>
  )
}
