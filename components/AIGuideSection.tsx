import { useEffect, useMemo, useRef, useState } from 'react'

interface Message {
  id?: string
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
  initialMessage?: string
}

export default function AIGuideSection({ culturalActivities, userLocation, initialMessage }: AIGuideSectionProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hello! I'm your AI tourist guide. I can help you discover cultural activities, local experiences, and provide navigation assistance. What would you like to know about your destination?"
  }])
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (initialMessage && input === '') {
      setInput(initialMessage)
      // Auto-send the initial message
      setTimeout(() => {
        sendAIMessage(initialMessage)
      }, 100)
    }
  }, [initialMessage])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const quickReply = (text: string) => {
    setInput(text)
    sendAIMessage(text)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendAIMessage()
    }
  }

  const formatNearbySummary = () => {
    if (!culturalActivities || culturalActivities.length === 0) return 'I will search for cultural activities near you.'
    const top = culturalActivities.slice(0, 3)
    const list = top.map(a => `${a.name}${a.distance ? ` (${a.distance})` : ''}${a.rating ? ` • ${a.rating}★` : ''}`).join('; ')
    return `Here are a few nearby options: ${list}. Ask me for directions to any of them.`
  }

  // Client-side AI call that mirrors the flow in js/chat.js; falls back to local generator
  const sendAIMessage = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text) return

    const userId = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const thinkingId = `t_${Date.now()}_${Math.random().toString(36).slice(2)}`

    setMessages((m) => [...m, { id: userId, role: 'user', content: text }])
    setInput('')
    setMessages((m) => [...m, { id: thinkingId, role: 'assistant', content: 'Thinking…' }])

    try {
      // Attempt to use OpenRouter (same as js/chat.js)
      const apiKey = "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"
      if (!apiKey) {
        // Fallback to local generator if no key
        const fallback = generateAIResponse(text, userLocation ?? undefined as any, culturalActivities)
        setMessages((m) => m.map(msg => msg.id === thinkingId ? { ...msg, content: fallback } : msg))
        return
      }

      const call1 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: 'openai/gpt-oss-120b:free', messages: [{ role: 'user', content: text }], reasoning: { enabled: true } })
      })

      const result1 = await call1.json()
      const assistantMessage = result1?.choices?.[0]?.message
      if (!assistantMessage) throw new Error('No response from model')

      const messagesForSecond = [
        { role: 'user', content: text },
        { role: 'assistant', content: assistantMessage.content, reasoning_details: assistantMessage.reasoning_details },
        { role: 'user', content: 'Are you sure? Think carefully.' }
      ]

      const call2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: 'openai/gpt-oss-120b:free', messages: messagesForSecond })
      })

      const result2 = await call2.json()
      const finalMessage = result2?.choices?.[0]?.message?.content || assistantMessage.content

      setMessages((m) => m.map(msg => msg.id === thinkingId ? { ...msg, content: finalMessage } : msg))
    } catch (err: any) {
      setMessages((m) => m.map(msg => msg.id === thinkingId ? { ...msg, content: `Error: ${err?.message || err}` } : msg))
    }
  }

  // Retain the local fallback generator for when no API key is available
  const generateAIResponse = (message: string, userLocationArg: any, culturalActivitiesArg: any) => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('near me') || lowerMessage.includes('nearby')) {
      if (userLocationArg && culturalActivitiesArg.length > 0) {
        const nearbyList = culturalActivitiesArg.slice(0, 3).map((a: any) => `${a.name} (${a.distance || 'nearby'})`).join(', ')
        return `Based on your current location, here are nearby cultural activities: ${nearbyList}. Would you like more details about any of these?`
      } else {
        return 'I need access to your location to show nearby activities. Please enable location services and refresh the page.'
      }
    } else if (lowerMessage.includes('activity') || lowerMessage.includes('what to do')) {
      if (culturalActivitiesArg.length > 0) {
        const top = culturalActivitiesArg.slice(0, 3).map((a: any) => `${a.name} (${a.distance || 'nearby'}, ${a.rating || '4.5'}★)`).join(', ')
        return `Based on your location, I recommend: ${top}. These are all within walking distance!`
      }
      return 'I can help you with cultural activities and recommendations.'
    }
    return 'I can help you with information about cultural activities, local experiences, navigation, festivals, and creating personalized itineraries. Could you please be more specific about what you\'d like to know?'
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
            <button onClick={() => sendAIMessage()} className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
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
