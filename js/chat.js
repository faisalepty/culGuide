// Chat and OpenRouter integration

import { aiResponses } from './data.js';

export function handleAIKeyPress(event) {
  if (event.key === 'Enter') {
    sendAIMessage();
  }
}

export function askAIGuide(question) {
  const input = document.getElementById('ai-input');
  if (input) input.value = question;
  sendAIMessage();
}

export function addMessageToChat(message, sender) {
  const chatContainer = document.getElementById('chat-container');
  const messageDiv = document.createElement('div');
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  messageDiv.dataset.id = id;

  if (sender === 'user') {
    messageDiv.className = 'flex justify-end';
    messageDiv.innerHTML = `
      <div class="max-w-xs md:max-w-md bg-primary text-white rounded-2xl rounded-tr-none p-4 shadow-sm">
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  } else {
    messageDiv.className = 'flex justify-start';
    messageDiv.innerHTML = `
      <div class="max-w-xs md:max-w-md bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
        <p class="text-gray-800">${escapeHTML(message)}</p>
      </div>
    `;
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return id;
}

export function replaceLastAIMessage(id, newContent) {
  const chatContainer = document.getElementById('chat-container');
  const nodes = Array.from(chatContainer.children);
  const target = nodes.reverse().find(n => n.dataset.id === id);
  const bubble = target ? target.querySelector('p') : null;
  if (bubble) bubble.textContent = newContent;
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const message = input.value.trim();
  if (!message) return;

  addMessageToChat(message, 'user');
  input.value = '';

  const thinkingId = addMessageToChat('Thinking…', 'ai');

  try {
    // Ensure config.js has attempted to load the key
    if (window.CONFIG && window.CONFIG.openrouter && window.CONFIG.openrouter.readyPromise) {
      await window.CONFIG.openrouter.readyPromise.catch(() => {});
    }

    const apiKey = window.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OpenRouter API key. Make sure .env contains OPEN_ROUTER_API and you are serving over HTTP.');
    }

    // First API call with reasoning
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [ { role: 'user', content: message } ],
        reasoning: { enabled: true }
      })
    });

    const result = await response.json();
    const assistantMessage = result?.choices?.[0]?.message;
    if (!assistantMessage) throw new Error('No response from model');

    // Second API call continues reasoning with preserved reasoning_details
    const messages = [
      { role: 'user', content: message },
      { role: 'assistant', content: assistantMessage.content, reasoning_details: assistantMessage.reasoning_details },
      { role: 'user', content: 'Are you sure? Think carefully.' }
    ];

    const response2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b:free', messages })
    });

    const result2 = await response2.json();
    const finalMessage = result2?.choices?.[0]?.message?.content || assistantMessage.content;

    replaceLastAIMessage(thinkingId, finalMessage);
  } catch (err) {
    replaceLastAIMessage(thinkingId, `Error: ${err.message}`);
  }
}

// Fallback text generator retained (not used in primary flow)
export function generateAIResponse(message, userLocation, culturalActivities) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('near me') || lowerMessage.includes('nearby')) {
    if (userLocation && culturalActivities.length > 0) {
      const nearbyList = culturalActivities.slice(0, 3).map(a => `${a.name} (${a.distance || 'nearby'})`).join(', ');
      return `Based on your current location, here are nearby cultural activities: ${nearbyList}. Would you like more details about any of these?`;
    } else {
      return 'I need access to your location to show nearby activities. Please enable location services and refresh the page.';
    }
  } else if (lowerMessage.includes('activity') || lowerMessage.includes('what to do')) {
    if (culturalActivities.length > 0) {
      const top = culturalActivities.slice(0, 3).map(a => `${a.name} (${a.distance || 'nearby'}, ${a.rating || '4.5'}★)`).join(', ');
      return `Based on your location, I recommend: ${top}. These are all within walking distance!`;
    }
    return aiResponses.activities;
  } else if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('eat')) {
    return aiResponses.food;
  } else if (lowerMessage.includes('how to get') || lowerMessage.includes('direction') || lowerMessage.includes('route')) {
    return "I can provide directions to any cultural site! Click 'Get Directions' on any map marker, or tell me which specific location you'd like to visit.";
  } else if (lowerMessage.includes('festival') || lowerMessage.includes('event')) {
    return aiResponses.festivals;
  } else if (lowerMessage.includes('itinerary') || lowerMessage.includes('plan') || lowerMessage.includes('schedule')) {
    return aiResponses.itinerary;
  } else if (lowerMessage.includes('location') || lowerMessage.includes('where am i')) {
    if (userLocation) {
      return `You are currently at coordinates ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}. I've found ${culturalActivities.length} cultural activities near your location!`;
    }
    return "I don't have access to your location. Please enable location services to get personalized recommendations.";
  }
  return 'I can help you with information about cultural activities, local experiences, navigation, festivals, and creating personalized itineraries. Could you please be more specific about what you\'d like to know?';
}
