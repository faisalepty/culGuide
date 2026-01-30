import Image from 'next/image'

interface HeroSectionProps {
  setActiveSection: (section: string) => void
}

export default function HeroSection({ setActiveSection }: HeroSectionProps) {
  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-dark mb-6">
            Discover <span className="text-primary">Cultural Treasures</span> with AI Assistance
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your personal AI tourist guide that helps you explore cultural activities, local experiences, 
            and navigate through the area with interactive maps. Get personalized recommendations based on your interests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setActiveSection('ai-guide')} 
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-comment-alt"></i>
              <span>Chat with AI Guide</span>
            </button>
            <button 
              onClick={() => setActiveSection('map')} 
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-map-marked-alt"></i>
              <span>Explore Map</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-1">
            <Image 
              src="https://picsum.photos/600/400?random=1" 
              alt="Tourists exploring cultural heritage site" 
              width={600}
              height={400}
              className="w-full h-auto rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <i className="fas fa-star text-white text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-dark">Top Rated</h4>
                <p className="text-sm text-gray-600">Cultural Activities</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              "The AI guide recommended the perfect cultural trail for our family vacation!"
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}