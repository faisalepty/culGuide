import { useState, useRef, useEffect } from 'react'

interface Message {
  id?: string
  role: 'assistant' | 'user'
  content: string
}

interface FloatingChatProps {
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
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function FloatingChat({ culturalActivities, userLocation, initialMessage, isOpen, setIsOpen }: FloatingChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hello! I'm your AI tourist guide. I can help you discover cultural activities, local experiences, and provide navigation assistance. What would you like to know about your destination?"
  }])
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (initialMessage && input === '' && isOpen) {
      setInput(initialMessage)
      setTimeout(() => {
        sendAIMessage(initialMessage)
      }, 100)
    }
  }, [initialMessage, isOpen])

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
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white hover:scale-110"
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'} text-xl`}></i>
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-primary text-lg"></i>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">CultureGuide AI</h3>
                <p className="text-white/80 text-xs">Your personal tourist guide</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs p-3 shadow-sm rounded-lg text-sm ${m.role === 'assistant' ? 'bg-white rounded-tl-none text-gray-800' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                  <p>{m.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 space-y-2 bg-white">
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about activities..." 
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors duration-200"
                onKeyDown={handleKeyDown}
              />
              <button onClick={() => sendAIMessage()} className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>

            {/* Quick Replies */}
            <div className="flex flex-wrap gap-1">
              <button onClick={() => quickReply('What is near me?')} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors duration-200">Near me</button>
              <button onClick={() => quickReply('Local festivals')} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors duration-200">Festivals</button>
              <button onClick={() => quickReply('Food recommendations')} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors duration-200">Food</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
