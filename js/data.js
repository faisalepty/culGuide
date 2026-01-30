// Data and mock APIs

// Default cultural activities (fallback)
export const defaultActivities = [
  { id: 1, name: "Historical Museum", type: "museum", lat: 40.7128, lng: -74.006, description: "Local history and artifacts museum" },
  { id: 2, name: "Cultural Theater", type: "performance", lat: 40.7145, lng: -74.0082, description: "Traditional performances venue" },
  { id: 3, name: "Traditional Market", type: "local", lat: 40.711, lng: -74.0095, description: "Local food and crafts market" },
  { id: 4, name: "Heritage Site", type: "historical", lat: 40.7135, lng: -74.0045, description: "UNESCO World Heritage site" },
  { id: 5, name: "Art Gallery", type: "museum", lat: 40.715, lng: -74.007, description: "Contemporary local art gallery" },
  { id: 6, name: "Craft Workshop", type: "workshop", lat: 40.7105, lng: -74.0055, description: "Traditional craft workshops" }
];

export const aiResponses = {
  greeting: "Hello! I'm your AI tourist guide. I can help you discover cultural activities, local experiences, and provide navigation assistance. What would you like to know about your destination?",
  activities: "Based on your interests, I recommend these cultural activities: 1) Historical Museum (open 9AM-6PM), 2) Traditional Pottery Workshop (hands-on experience), 3) Cultural Theater (nightly performances). Would you like more details about any of these?",
  food: "For authentic local cuisine, I recommend: 1) Traditional Market for street food, 2) Family-run restaurant in the old town, 3) Cooking class to learn local recipes. The market is open daily from 6AM-8PM.",
  navigation: "To get from the museum to the old town: Take bus #5 from Museum Street (every 15 mins, 10-minute ride) or walk (20 minutes through the cultural district). I can show you the route on the map.",
  festivals: "This month's cultural festivals: 1) Traditional Dance Festival (weekend, free entry), 2) Food & Culture Fair (next Saturday), 3) Heritage Day (guided tours). Check the activities section for details.",
  itinerary: "For a 3-day cultural itinerary: Day 1: Historical sites & museum. Day 2: Workshop & local market. Day 3: Cultural performance & heritage tour. I can customize this based on your preferences."
};

// Simulate API call for nearby activities
export function simulateNearbyActivitiesAPI(lat, lng) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activities = [
        { id: 1, name: "Historic Downtown Art District", type: "historical", lat: lat + 0.08, lng: lng + 0.05, description: "Victorian-era buildings housing galleries, cafes, and artisan shops", distance: "12.3 km", rating: 4.8 },
        { id: 2, name: "Regional Heritage Museum", type: "museum", lat: lat - 0.06, lng: lng + 0.12, description: "Interactive exhibits on regional history and indigenous culture", distance: "15.7 km", rating: 4.7 },
        { id: 3, name: "Riverside Cultural Center", type: "performance", lat: lat + 0.15, lng: lng - 0.08, description: "Live music, theater performances, and cultural festivals", distance: "18.9 km", rating: 4.9 },
        { id: 4, name: "Central Farmers Market", type: "local", lat: lat - 0.04, lng: lng - 0.07, description: "Local craftspeople, organic foods, and traditional cooking demos", distance: "8.2 km", rating: 4.6 },
        { id: 5, name: "Modern Art Gallery", type: "museum", lat: lat + 0.11, lng: lng + 0.14, description: "Contemporary works by emerging local and international artists", distance: "19.4 km", rating: 4.5 },
        { id: 6, name: "Traditional Craft Village", type: "workshop", lat: lat - 0.13, lng: lng + 0.06, description: "Pottery, weaving, and woodworking workshops with master artisans", distance: "16.8 km", rating: 4.8 },
        { id: 7, name: "Historic Cemetery & Chapel", type: "historical", lat: lat + 0.03, lng: lng + 0.05, description: "19th-century cemetery with notable graves and historic chapel", distance: "5.1 km", rating: 4.4 },
        { id: 8, name: "Botanical Gardens", type: "local", lat: lat - 0.09, lng: lng - 0.16, description: "Native plant gardens with outdoor concerts and art installations", distance: "19.7 km", rating: 4.7 },
        { id: 9, name: "Old Town Square", type: "historical", lat: lat + 0.02, lng: lng - 0.03, description: "Historic town center with colonial architecture and weekend markets", distance: "3.8 km", rating: 4.6 },
        { id: 10, name: "Science & Discovery Center", type: "museum", lat: lat - 0.08, lng: lng + 0.09, description: "Interactive science exhibits and planetarium shows", distance: "13.2 km", rating: 4.3 },
        { id: 11, name: "Community Theater", type: "performance", lat: lat + 0.05, lng: lng + 0.08, description: "Local theater productions and musical performances", distance: "9.7 km", rating: 4.4 },
        { id: 12, name: "Antique District", type: "local", lat: lat - 0.02, lng: lng + 0.04, description: "Historic antique shops and vintage collectibles", distance: "4.5 km", rating: 4.2 },
        { id: 13, name: "Lakeside Park & Amphitheater", type: "performance", lat: lat + 0.12, lng: lng + 0.02, description: "Outdoor concerts and festivals by the lake", distance: "14.1 km", rating: 4.8 },
        { id: 14, name: "Historic Mill & Museum", type: "historical", lat: lat - 0.07, lng: lng - 0.11, description: "Restored 1800s gristmill with working demonstrations", distance: "12.9 km", rating: 4.5 },
        { id: 15, name: "Cultural Heritage Trail", type: "historical", lat: lat + 0.06, lng: lng - 0.05, description: "Self-guided walking trail through historic neighborhoods", distance: "7.8 km", rating: 4.3 },
        { id: 16, name: "Artisan Brewery & Tours", type: "local", lat: lat - 0.05, lng: lng + 0.07, description: "Local craft brewery with tours and tasting rooms", distance: "8.9 km", rating: 4.6 },
        { id: 17, name: "Children's Discovery Museum", type: "museum", lat: lat + 0.04, lng: lng + 0.11, description: "Interactive exhibits and hands-on learning for families", distance: "11.8 km", rating: 4.7 },
        { id: 18, name: "Historic Train Station", type: "historical", lat: lat - 0.03, lng: lng - 0.09, description: "Restored 1920s train station with railway museum", distance: "9.4 km", rating: 4.4 },
        { id: 19, name: "Local Music Venue", type: "performance", lat: lat + 0.07, lng: lng + 0.06, description: "Intimate venue featuring local and touring musicians", distance: "10.2 km", rating: 4.5 },
        { id: 20, name: "Sculpture Garden", type: "museum", lat: lat - 0.1, lng: lng + 0.03, description: "Outdoor sculpture park with rotating contemporary installations", distance: "11.1 km", rating: 4.6 }
      ];
      resolve(activities);
    }, 1000);
  });
}
