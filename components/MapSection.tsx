import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
// Helper to recenter map on state change
const RecenterOnChange = dynamic(() => import('react-leaflet').then((m: any) => {
  const { useMap } = m
  return function Recenter({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
      map.setView(center)
    }, [center, map])
    return null
  }
}), { ssr: false })

interface MapSectionProps {
  culturalActivities: any[]
  userLocation: { lat: number; lng: number } | null
  onAskAboutLocation?: (locationName: string) => void
}

export default function MapSection({ culturalActivities, userLocation, onAskAboutLocation }: MapSectionProps) {
  const [fullScreen, setFullScreen] = useState(false)
  // Search UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')
  // Map and data state
  const [activities, setActivities] = useState<any[]>(culturalActivities || [])
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Leaflet icon configuration on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      })
    }
  }, [])

  const centerLat = (mapCenter?.lat) ?? (userLocation ? userLocation.lat : 40.7128)
  const centerLng = (mapCenter?.lng) ?? (userLocation ? userLocation.lng : -74.0060)

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
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Keep map centered on state changes */}
      <RecenterOnChange center={[centerLat, centerLng]} />
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

      {(activities || []).map((activity) => (
        <Marker key={activity.id} position={[activity.lat, activity.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{activity.name}</h3>
              <p className="text-gray-600">{activity.description}</p>
              {activity.distance && <p className="text-sm text-gray-500">Distance: {activity.distance}</p>}
              {activity.rating && <p className="text-sm text-yellow-600">Rating: {activity.rating}★</p>}
              <div className="mt-2 flex gap-2 flex-wrap">
                <button 
                  onClick={() => onAskAboutLocation?.(activity.name)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ask CulGuide
                </button>
                <button 
                  onClick={() => getDirections(activity.lat, activity.lng)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Get Directions
                </button>
              </div>
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

      {/* Search UI */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!searchQuery.trim()) return
          setLoading(true)
          setError(null)
          try {
            const query = searchCategory && searchCategory !== 'all' ? `${searchQuery} ${searchCategory}` : searchQuery
            const url = `https://google.serper.dev/places?q=${encodeURIComponent(query)}&apiKey=${encodeURIComponent(process.env.NEXT_PUBLIC_SERPER_API_KEY || '09481e5fd5692373f224976f48b76d8c79c24ba6')}`
            const res = await fetch(url, { method: 'GET' })
            if (!res.ok) throw new Error(`Request failed: ${res.status}`)
            const data = await res.json()
            const places = Array.isArray(data?.places) ? data.places : []
            const mapped = places.map((p: any) => ({
              id: p.cid || `${p.latitude},${p.longitude},${p.title}`,
              name: p.title,
              description: p.address || p.category || '',
              lat: p.latitude,
              lng: p.longitude,
              rating: p.rating,
            }))
            setActivities(mapped)
            if (mapped.length) setMapCenter({ lat: mapped[0].lat, lng: mapped[0].lng })
          } catch (err: any) {
            setError(err?.message || 'Search failed')
            setActivities([])
          } finally {
            setLoading(false)
          }
        }}
        className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3"
        aria-label="Map search"
      >
        <div className="flex-1">
          <label htmlFor="map-search" className="sr-only">Search places</label>
          <input
            id="map-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search museums, galleries, events..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="w-full md:w-56">
          <label htmlFor="map-category" className="sr-only">Category</label>
          <select
            id="map-category"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All categories</option>
            <option value="museum">Museums & Galleries</option>
            <option value="performance">Performances</option>
            <option value="experience">Local Experiences</option>
            <option value="landmark">Landmarks</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-dark text-white px-4 py-2 rounded-lg hover:bg-black/80 disabled:opacity-60"
          aria-label="Search"
          disabled={loading}
        >
          <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-search'}`}></i>
          <span className="font-medium">{loading ? 'Searching' : 'Search'}</span>
        </button>
        {error && (
          <span className="text-sm text-red-600 md:ml-2">{error}</span>
        )}
      </form>

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

          {/* Fullscreen Search UI */}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!searchQuery.trim()) return
              setLoading(true)
              setError(null)
              try {
                const query = searchCategory && searchCategory !== 'all' ? `${searchQuery} ${searchCategory}` : searchQuery
                const url = `https://google.serper.dev/places?q=${encodeURIComponent(query)}&apiKey=${encodeURIComponent(process.env.NEXT_PUBLIC_SERPER_API_KEY || '09481e5fd5692373f224976f48b76d8c79c24ba6')}`
                const res = await fetch(url, { method: 'GET' })
                if (!res.ok) throw new Error(`Request failed: ${res.status}`)
                const data = await res.json()
                const places = Array.isArray(data?.places) ? data.places : []
                const mapped = places.map((p: any) => ({
                  id: p.cid || `${p.latitude},${p.longitude},${p.title}`,
                  name: p.title,
                  description: p.address || p.category || '',
                  lat: p.latitude,
                  lng: p.longitude,
                  rating: p.rating,
                }))
                setActivities(mapped)
                if (mapped.length) setMapCenter({ lat: mapped[0].lat, lng: mapped[0].lng })
              } catch (err: any) {
                setError(err?.message || 'Search failed')
                setActivities([])
              } finally {
                setLoading(false)
              }
            }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] w-[92%] md:w-[70%] lg:w-[50%] flex items-stretch gap-2"
            aria-label="Map search fullscreen"
          >
            <label htmlFor="map-search-fullscreen" className="sr-only">Search places</label>
            <input
              id="map-search-fullscreen"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search museums, galleries, events..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="map-category-fullscreen" className="sr-only">Category</label>
            <select
              id="map-category-fullscreen"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="hidden md:block w-48 border border-gray-300 rounded-lg px-3 py-2 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="museum">Museums</option>
              <option value="performance">Performances</option>
              <option value="experience">Experiences</option>
              <option value="landmark">Landmarks</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-dark text-white px-4 py-2 rounded-lg hover:bg-black/80 shadow disabled:opacity-60"
              disabled={loading}
            >
              <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-search'}`}></i>
              <span className="font-medium hidden sm:inline">{loading ? 'Searching' : 'Search'}</span>
            </button>
            {error && (
              <span className="text-sm text-red-600 ml-2 bg-white/80 px-2 py-1 rounded">{error}</span>
            )}
          </form>

          <div className="w-full h-full">
            {MapContent}
          </div>
        </div>
      )}
    </section>
  )
}
