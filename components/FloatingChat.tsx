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
    content: "Hello! I'm your AI tourist guide. I can help you discover amazing cultural activities and fun experiences at specific locations. What area are you interested in exploring?"
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

  // Function to clean formatting from text
  const cleanTextFormatting = (text: string): string => {
    // Remove markdown formatting
    let cleaned = text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/#{1,6}\s?/g, '') // Remove heading markers
      .replace(/`{1,3}/g, '') // Remove code markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace markdown links with just text
      .replace(/~~/g, '') // Remove strikethrough markers
      .replace(/\n\s*[-*+]\s+/g, '. ') // Convert list markers to periods
      .replace(/\n\s*\d+\.\s+/g, '. ') // Remove numbered list markers
      .replace(/\s{2,}/g, ' ') // Normalize multiple spaces
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple newlines
    
    // Ensure proper paragraph formatting
    cleaned = cleaned
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('. ')
      .replace(/\.\s+\./g, '. ')
      .replace(/\s+\./g, '.');
    
    return cleaned;
  }

  // Updated system prompt for location-focused responses
  const SYSTEM_PROMPT = `You are an enthusiastic travel guide assistant focused exclusively on locations and activities. Provide information only about specific places mentioned and describe how amazing and fun the activities are in those areas.

Write in clear, well-structured paragraphs using plain text. Do not use any asterisks, bullet points, markdown, or special formatting. Use complete sentences with proper punctuation.

Keep responses concise, upbeat, and focused on the excitement of experiences in the locations discussed. Avoid general travel advice or non-location topics.`

  // Client-side AI call with updated system prompt
  const sendAIMessage = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text) return

    const userId = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const thinkingId = `t_${Date.now()}_${Math.random().toString(36).slice(2)}`

    setMessages((m) => [...m, { id: userId, role: 'user', content: text }])
    setInput('')
    setMessages((m) => [...m, { id: thinkingId, role: 'assistant', content: 'Thinking…' }])

    try {
      // Attempt to use OpenRouter with system prompt
      const apiKey = "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"
      if (!apiKey) {
        // Fallback to local generator if no key
        const fallback = generateAIResponse(text, userLocation ?? undefined as any, culturalActivities)
        setMessages((m) => m.map(msg => msg.id === thinkingId ? { ...msg, content: fallback } : msg))
        return
      }

      // First call with system prompt
      const call1 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
          ],
          reasoning: { enabled: true }
        })
      })

      const result1 = await call1.json()
      const assistantMessage = result1?.choices?.[0]?.message
      if (!assistantMessage) throw new Error('No response from model')

      // Clean the response text
      const cleanResponse1 = cleanTextFormatting(assistantMessage.content)

      // Second call for verification with system prompt
      const messagesForSecond = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
        { role: 'assistant', content: cleanResponse1 },
        { role: 'user', content: 'Are you sure? Think carefully about the specific locations and how fun the activities are. Use plain text only with no formatting.' }
      ]

      const call2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          model: 'openai/gpt-oss-120b:free', 
          messages: messagesForSecond 
        })
      })

      const result2 = await call2.json()
      const finalMessageRaw = result2?.choices?.[0]?.message?.content || cleanResponse1
      
      // Clean the final message
      const finalMessage = cleanTextFormatting(finalMessageRaw)

      setMessages((m) => m.map(msg => msg.id === thinkingId ? { ...msg, content: finalMessage } : msg))
    } catch (err: any) {
      setMessages((m) => m.map(msg => msg.id === thinkingId ? { ...msg, content: `Error: ${err?.message || err}` } : msg))
    }
  }

  // Updated local fallback generator with location/activity focus
  const generateAIResponse = (message: string, userLocationArg: any, culturalActivitiesArg: any) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('near me') || lowerMessage.includes('nearby') || lowerMessage.includes('around')) {
      if (userLocationArg && culturalActivitiesArg.length > 0) {
        const nearbyActivities = culturalActivitiesArg.slice(0, 3)
        let response = "Right around you, there are some amazing activities. "
        nearbyActivities.forEach((activity: any, index: number) => {
          response += `At ${activity.name} which is ${activity.distance || 'just steps away'} you can enjoy ${activity.description}. `
          if (activity.rating) {
            response += `With a ${activity.rating} star rating, its incredibly fun. `
          }
        })
        return response + "Which location sounds most exciting to you?"
      } else {
        return 'I need access to your location to show you the amazing activities nearby. Please enable location services to discover fun experiences around you.'
      }
    } else if (lowerMessage.includes('activity') || lowerMessage.includes('what to do') || lowerMessage.includes('fun')) {
      if (culturalActivitiesArg.length > 0) {
        const topActivities = culturalActivitiesArg.slice(0, 3)
        let response = "Here are some fantastic activities at amazing locations. "
        topActivities.forEach((activity: any, index: number) => {
          response += `${activity.name} offers ${activity.description}. `
          if (activity.distance) {
            response += `Located ${activity.distance} away, this is an absolutely fun experience. `
          }
        })
        return response + "These locations promise unforgettable adventures."
      }
      return 'Tell me a location, and I will share the most amazing and fun activities you can do there.'
    } else if (lowerMessage.includes('location') || lowerMessage.includes('place') || lowerMessage.includes('where')) {
      if (culturalActivitiesArg.length > 0) {
        const locations = culturalActivitiesArg.slice(0, 2).map((a: any) => a.name).join(' and ')
        return `The ${locations} locations are absolutely incredible. At these places, you will find amazing cultural experiences that are so much fun. Which specific location would you like to explore?`
      }
    }
    return 'I am here to tell you about amazing locations and the incredibly fun activities you can experience there. Could you mention a specific place or area you are interested in?'
  }

  // Update quick reply buttons to focus on location/activity queries
  const quickReplies = [
    { text: 'What amazing things near me?', emoji: '📍' },
    { text: 'Most fun location around?', emoji: '🎉' },
    { text: 'Top activity spots?', emoji: '⭐' },
    { text: 'Exciting cultural places?', emoji: '🏛️' }
  ]

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white hover:scale-110"
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-map-marker-alt'} text-xl`}></i>
      </button>

      {/* Floating Chat Window - Made larger */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[500px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-5">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <i className="fas fa-map-marked-alt text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">Location Guide AI</h3>
                <p className="text-white/80 text-sm">Discover amazing places & fun activities</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto text-white/80 hover:text-white transition-colors duration-200"
                title="Close chat"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Messages Container - Made larger */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 shadow-sm rounded-xl text-base ${m.role === 'assistant' ? 'bg-white rounded-tl-none text-gray-800 border border-gray-100' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area - Made larger */}
          <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
            <div className="flex space-x-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about locations and fun activities..." 
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                onKeyDown={handleKeyDown}
              />
              <button onClick={() => sendAIMessage()} className="bg-primary text-white px-5 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                <i className="fas fa-paper-plane"></i>
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            {/* Updated Quick Replies with location/activity focus */}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button 
                  key={index}
                  onClick={() => quickReply(reply.text)}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-2 rounded-lg text-sm hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center gap-2 border border-blue-100 hover:border-blue-200"
                >
                  <span className="text-base">{reply.emoji}</span>
                  <span>{reply.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}