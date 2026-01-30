import { useState, useEffect } from 'react'

interface UserLocation {
  lat: number
  lng: number
}

interface CulturalActivity {
  id: number
  name: string
  type: string
  lat: number
  lng: number
  description: string
  distance?: string
  rating?: number
}

export function useLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationStatus, setLocationStatus] = useState('Getting location...')
  const [culturalActivities, setCulturalActivities] = useState<CulturalActivity[]>([])

  const defaultActivities: CulturalActivity[] = [
    { id: 1, name: "Historical Museum", type: "museum", lat: 40.7128, lng: -74.0060, description: "Local history and artifacts museum" },
    { id: 2, name: "Cultural Theater", type: "performance", lat: 40.7145, lng: -74.0082, description: "Traditional performances venue" },
    { id: 3, name: "Traditional Market", type: "local", lat: 40.7110, lng: -74.0095, description: "Local food and crafts market" }
  ]

  const simulateNearbyActivitiesAPI = (lat: number, lng: number): Promise<CulturalActivity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activities: CulturalActivity[] = [
          {
            id: 1,
            name: "Historic Downtown Art District",
            type: "historical",
            lat: lat + 0.08,
            lng: lng + 0.05,
            description: "Victorian-era buildings housing galleries, cafes, and artisan shops",
            distance: "12.3 km",
            rating: 4.8
          },
          {
            id: 2,
            name: "Regional Heritage Museum",
            type: "museum",
            lat: lat - 0.06,
            lng: lng + 0.12,
            description: "Interactive exhibits on regional history and indigenous culture",
            distance: "15.7 km",
            rating: 4.7
          },
          {
            id: 3,
            name: "Riverside Cultural Center",
            type: "performance",
            lat: lat + 0.15,
            lng: lng - 0.08,
            description: "Live music, theater performances, and cultural festivals",
            distance: "18.9 km",
            rating: 4.9
          },
          {
            id: 4,
            name: "Central Farmers Market",
            type: "local",
            lat: lat - 0.04,
            lng: lng - 0.07,
            description: "Local craftspeople, organic foods, and traditional cooking demos",
            distance: "8.2 km",
            rating: 4.6
          },
          {
            id: 5,
            name: "Modern Art Gallery",
            type: "museum",
            lat: lat + 0.11,
            lng: lng + 0.14,
            description: "Contemporary works by emerging local and international artists",
            distance: "19.4 km",
            rating: 4.5
          }
        ]
        resolve(activities)
      }, 1000)
    })
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported')
      setUserLocation({ lat: 40.7128, lng: -74.0060 })
      setCulturalActivities(defaultActivities)
      return
    }

    setLocationStatus('Getting location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        setLocationStatus('Location detected')
        
        try {
          const activities = await simulateNearbyActivitiesAPI(location.lat, location.lng)
          setCulturalActivities(activities)
        } catch (error) {
          setCulturalActivities(defaultActivities)
        }
      },
      (error) => {
        let errorMsg = 'Location unavailable'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location unavailable'
            break
          case error.TIMEOUT:
            errorMsg = 'Location timeout'
            break
        }
        setLocationStatus(errorMsg)
        setUserLocation({ lat: 40.7128, lng: -74.0060 })
        setCulturalActivities(defaultActivities)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    )
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return {
    userLocation,
    locationStatus,
    culturalActivities,
    getCurrentLocation
  }
}