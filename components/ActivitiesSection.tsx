export default function ActivitiesSection() {
  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">Cultural Activities & Experiences</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">Discover the best cultural activities, workshops, tours, and local experiences curated by our AI guide.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[{
          title: 'Traditional Pottery Workshop',
          tag: 'Workshop',
          img: 'https://picsum.photos/400/250?random=2',
          description: 'Learn ancient pottery techniques from local artisans. 3-hour hands-on experience with materials provided.',
          price: '$45',
          cta: 'Tell me more about the pottery workshop'
        },{
          title: 'Historical District Walking Tour',
          tag: 'Tour',
          img: 'https://picsum.photos/400/250?random=3',
          description: 'Guided tour through the old town with stories about architecture, legends, and local history.',
          price: '$25',
          cta: 'What will I see on the historical walking tour?'
        },{
          title: 'Traditional Dance Festival',
          tag: 'Festival',
          img: 'https://picsum.photos/400/250?random=4',
          description: 'Annual cultural festival featuring traditional dances, music, and costumes from the region.',
          price: 'Free',
          cta: 'When is the traditional dance festival?'
        }].map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 activity-card">
            <div className="relative">
              {/* eslint-disable @next/next/no-img-element */}
              <img src={card.img} alt={card.title} className="w-full h-48 object-cover" />
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">{card.tag}</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-dark mb-2">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-accent font-bold">{card.price}</span>
                  <span className="text-gray-500 text-sm ml-2">{card.tag === 'Free' ? '' : 'per person'}</span>
                </div>
                <button className="text-primary font-medium hover:text-blue-700 transition-colors duration-200">Ask AI Guide</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">Personalized Cultural Itinerary</h3>
            <p className="mb-6">Let our AI guide create a personalized cultural itinerary based on your interests, available time, and budget.</p>
            <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">Get Personalized Itinerary</button>
          </div>
          <div className="bg-white/20 rounded-xl p-6">
            <h4 className="font-bold mb-3">Itinerary Features:</h4>
            <ul className="space-y-2">
              {['Based on your interests','Optimized route planning','Budget considerations','Transportation options'].map((f) => (
                <li key={f} className="flex items-center space-x-2">
                  <i className="fas fa-check-circle"></i>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
