export default function AboutSection() {
  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">About CultureGuide AI</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">We combine artificial intelligence with local expertise to provide tourists with the best cultural experiences and navigation assistance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h3 className="text-2xl font-bold text-dark mb-6">Our Mission</h3>
          <p className="text-gray-600 mb-6">We believe that tourism should be about authentic cultural experiences, not just checking landmarks off a list. Our AI guide helps tourists discover the soul of a destination through its cultural activities, traditions, and local interactions.</p>
          <p className="text-gray-600 mb-8">By combining AI technology with curated local knowledge, we provide personalized recommendations that help tourists have meaningful experiences while supporting local cultural preservation.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-700">Cultural Activities</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-gray-700">AI Assistance</div>
            </div>
          </div>
        </div>
        <div className="relative">
          {/* eslint-disable @next/next/no-img-element */}
          <img 
            src="https://picsum.photos/500/350?random=5" 
            alt="Tourists enjoying cultural experience" 
            className="w-full rounded-2xl shadow-xl"
          />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg max-w-xs">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-award text-white text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-dark">Award Winning</h4>
                <p className="text-sm text-gray-600">Best Tourism Innovation 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-dark mb-8 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            title: 'Ask Your AI Guide',
            desc: 'Chat with our AI assistant about your interests, questions, and travel plans.',
            color: 'primary'
          },{
            title: 'Get Personalized Recommendations',
            desc: 'Receive tailored suggestions for cultural activities, dining, and experiences.',
            color: 'secondary'
          },{
            title: 'Navigate & Explore',
            desc: 'Use our interactive map to navigate between cultural sites and plan your route.',
            color: 'accent'
          }].map((s, i) => (
            <div key={s.title} className="text-center">
              <div className={`w-16 h-16 bg-${s.color}/10 rounded-full flex items-center justify-center mx-auto mb-6`}>
                <div className={`w-12 h-12 bg-${s.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>{i+1}</div>
              </div>
              <h4 className="text-xl font-bold text-dark mb-3">{s.title}</h4>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
