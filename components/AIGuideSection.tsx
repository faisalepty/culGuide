import { useEffect, useMemo, useRef, useState } from 'react'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

interface AIGuideSectionProps {
  culturalActivities: Array<{
    id: number
    name: string
    description: string
    lat: number
    lng: number
    distance?: string
    rating?: number
  }>
  userLocation: { lat: number; lng: number } | null
}

export default function AIGuideSection({ culturalActivities, userLocation }: AIGuideSectionProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hello! I'm your AI tourist guide. I can help you discover cultural activities, local experiences, and provide navigation assistance. What would you like to know about your destination?"
  }])
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const quickReply = (text: string) => {
    setInput(text)
    handleSend(text)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const formatNearbySummary = () => {
    if (!culturalActivities || culturalActivities.length === 0) return 'I will search for cultural activities near you.'
    const top = culturalActivities.slice(0, 3)
    const list = top.map(a => `${a.name}${a.distance ? ` (${a.distance})` : ''}${a.rating ? ` • ${a.rating}★` : ''}`).join('; ')
    return `Here are a few nearby options: ${list}. Ask me for directions to any of them.`
  }

  const generateAssistantReply = (text: string): string => {
    const t = text.toLowerCase()
    if (t.includes('near me') || t.includes('nearby') || t.includes('where am i')) {
      if (!userLocation) {
        return 'I need access to your location to find nearby cultural activities. Please enable location services in your browser.'
      }
      return `${formatNearbySummary()}`
    }
    if (t.includes('festival')) {
      return 'Local festivals often happen on weekends and holidays. Check community calendars and cultural centers. I can suggest venues on the map section where festivals are commonly hosted.'
    }
    if (t.includes('food') || t.includes('restaurant')) {
      return 'For authentic cuisine, look for traditional markets and family-run eateries near cultural districts. Ask for regional specialties and seasonal dishes.'
    }
    if (t.includes('how do i get') || t.includes('directions')) {
      return 'Open the Map section, click a marker, and use the Get Directions button for turn-by-turn navigation from your current location.'
    }
    return 'I can help with cultural activities, local experiences, and navigation. Try asking: "What cultural activities are near me?" or "Create a 2-day cultural itinerary".'
  }

  const handleSend = (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text) return

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')

    // Simulated assistant reply using local context
    const reply = generateAssistantReply(text)
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    }, 400)
  }

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">Your AI Tourist Assistant</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">Ask questions about cultural activities, local events, transportation, dining, and get personalized recommendations for your stay.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-theater-masks text-primary text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-dark mb-3">Cultural Activities</h3>
          <p className="text-gray-600 mb-4">Get information about museums, historical sites, traditional performances, and local festivals happening during your visit.</p>
          <button onClick={() => quickReply('What cultural activities are near me?')} className="text-primary font-medium hover:text-blue-700 transition-colors duration-200">Ask about nearby activities →</button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-utensils text-secondary text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-dark mb-3">Local Experiences</h3>
          <p className="text-gray-600 mb-4">Discover authentic local dining, traditional crafts workshops, and unique experiences that tourists often miss.</p>
          <button onClick={() => quickReply('Where can I try authentic local cuisine?')} className="text-secondary font-medium hover:text-purple-700 transition-colors duration-200">Ask about food →</button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-route text-accent text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-dark mb-3">Navigation Help</h3>
          <p className="text-gray-600 mb-4">Get directions, transportation options, and the best routes between cultural sites and attractions.</p>
          <button onClick={() => quickReply('How do I get from the museum to the old town?')} className="text-accent font-medium hover:text-yellow-700 transition-colors duration-200">Ask for directions →</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-primary text-xl"></i>
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">CultureGuide AI Assistant</h3>
              <p className="text-white/80 text-sm">Ask me anything about cultural activities and local experiences</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div id="chat-container" ref={chatRef} className="h-96 overflow-y-auto mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs md:max-w-md p-4 shadow-sm rounded-2xl ${m.role === 'assistant' ? 'bg-white rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                  <p>{m.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cultural activities, local events, or navigation..." 
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors duration-200"
              onKeyDown={handleKeyDown}
            />
            <button onClick={() => handleSend()} className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <i className="fas fa-paper-plane"></i>
              <span className="hidden md:inline">Send</span>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => quickReply('What cultural activities are near me?')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">Near me</button>
            <button onClick={() => quickReply('Are there any festivals this month?')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">Local festivals</button>
            <button onClick={() => quickReply('Best traditional restaurants near me')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">Traditional food</button>
            <button onClick={() => quickReply('Where am I and what can I do here?')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">My location</button>
          </div>
        </div>
      </div>
    </section>
  )
}
