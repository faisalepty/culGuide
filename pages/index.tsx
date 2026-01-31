import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import AIGuideSection from '../components/AIGuideSection'
import FloatingChat from '../components/FloatingChat'
import MapSection from '../components/MapSection'
import ActivitiesSection from '../components/ActivitiesSection'
import AboutSection from '../components/AboutSection'
import Footer from '../components/Footer'
import { useLocation } from '../lib/useLocation'

export default function Home() {
  const [activeSection, setActiveSection] = useState('home')
  const { userLocation, locationStatus, culturalActivities, getCurrentLocation } = useLocation()
  const [chatMessage, setChatMessage] = useState('')

  const handleAskAboutLocation = (locationName: string) => {
    const message = `Tell me more about ${locationName}`
    setChatMessage(message)
    setActiveSection('ai-guide')
  }

  return (
    <>
      <Head>
        <title>CultureGuide AI - Your Personal Tourist Assistant</title>
        <meta name="description" content="AI-powered tourist guide providing cultural activities, local recommendations, and interactive navigation maps" />
        <meta name="keywords" content="tourist guide, cultural activities, AI assistant, travel, navigation, local experiences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-light font-sans text-dark">
        <Header 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          locationStatus={locationStatus}
          getCurrentLocation={getCurrentLocation}
        />
        
        <main className="container mx-auto px-4 py-8">
          {activeSection === 'home' && <HeroSection setActiveSection={setActiveSection} />}
          {activeSection === 'ai-guide' && <AIGuideSection culturalActivities={culturalActivities} userLocation={userLocation} initialMessage={chatMessage} />}
          {activeSection === 'map' && <MapSection culturalActivities={culturalActivities} userLocation={userLocation} onAskAboutLocation={handleAskAboutLocation} />}
          {activeSection === 'activities' && <ActivitiesSection />}
          {activeSection === 'about' && <AboutSection />}
        </main>

        <Footer setActiveSection={setActiveSection} />

        {/* Floating Chat Window */}
        <FloatingChat culturalActivities={culturalActivities} userLocation={userLocation} initialMessage={chatMessage} />
      </div>
    </>
  )
}