interface FooterProps {
  setActiveSection: (section: string) => void
}

export default function Footer({ setActiveSection }: FooterProps) {
  return (
    <footer className="bg-dark text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-compass text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-display font-bold">CultureGuide<span className="text-accent">AI</span></h3>
            </div>
            <p className="text-gray-400 mb-6">Your AI-powered companion for discovering cultural activities and navigating destinations.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors duration-200">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors duration-200">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors duration-200">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><button onClick={() => setActiveSection('home')} className="text-gray-400 hover:text-white transition-colors duration-200">Home</button></li>
              <li><button onClick={() => setActiveSection('activities')} className="text-gray-400 hover:text-white transition-colors duration-200">Cultural Activities</button></li>
              <li><button onClick={() => setActiveSection('map')} className="text-gray-400 hover:text-white transition-colors duration-200">Interactive Map</button></li>
              <li><button onClick={() => setActiveSection('ai-guide')} className="text-gray-400 hover:text-white transition-colors duration-200">AI Guide</button></li>
              <li><button onClick={() => setActiveSection('about')} className="text-gray-400 hover:text-white transition-colors duration-200">About Us</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Cultural Categories</h4>
            <ul className="space-y-3">
              <li><span className="text-gray-400">Museums & Galleries</span></li>
              <li><span className="text-gray-400">Historical Sites</span></li>
              <li><span className="text-gray-400">Traditional Workshops</span></li>
              <li><span className="text-gray-400">Local Festivals</span></li>
              <li><span className="text-gray-400">Cultural Performances</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">Contact & Support</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <i className="fas fa-envelope text-primary mt-1"></i>
                <span className="text-gray-400">support@cultureguide.ai</span>
              </li>
              <li className="flex items-start space-x-3">
                <i className="fas fa-phone text-primary mt-1"></i>
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt text-primary mt-1"></i>
                <span className="text-gray-400">123 Culture Street, Heritage City</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <h5 className="font-bold mb-3">Subscribe to Updates</h5>
              <div className="flex">
                <input type="email" placeholder="Your email" className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none" />
                <button className="bg-primary px-4 py-2 rounded-r-lg font-medium hover:bg-blue-700 transition-colors duration-200">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2023 CultureGuide AI. All rights reserved. | <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></p>
          <p className="mt-2">This website uses AI to provide tourist information. Always verify critical information with local sources.</p>
        </div>
      </div>
    </footer>
  )
}
