interface HeaderProps {
  activeSection: string
  setActiveSection: (section: string) => void
  locationStatus: string
  getCurrentLocation: () => void
}

export default function Header({ activeSection, setActiveSection, locationStatus, getCurrentLocation }: HeaderProps) {
  const getStatusColor = () => {
    if (locationStatus === 'Location detected') return 'bg-green-500'
    if (locationStatus === 'Getting location...') return 'bg-blue-500 animate-pulse'
    return 'bg-red-500'
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-compass text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-display font-bold text-primary">
              CulGuide<span className="text-accent">AI</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {['home', 'activities', 'map', 'ai-guide', 'about'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`font-medium transition-colors duration-200 capitalize ${
                  activeSection === section ? 'text-primary font-bold' : 'text-dark hover:text-primary'
                }`}
              >
                {section === 'ai-guide' ? 'AI Guide' : section}
              </button>
            ))}
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              <span className="text-gray-600">{locationStatus}</span>
              {locationStatus !== 'Location detected' && locationStatus !== 'Getting location...' && (
                <button onClick={getCurrentLocation} className="ml-2 text-blue-600 text-xs underline">
                  Retry
                </button>
              )}
            </div>
            <button 
              onClick={() => setActiveSection('ai-guide')} 
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <i className="fas fa-robot"></i>
              <span>Ask AI Guide</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}