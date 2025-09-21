import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConversationalWelcome from '../components/ConversationalWelcome'
import SummaryPopup from '../components/SummaryPopup'

function WelcomePage() {
  const navigate = useNavigate()
  const [showSummaryPopup, setShowSummaryPopup] = useState(false)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const handleRoadmapGenerated = async (roadmapData) => {
    try {
      setShowSummaryPopup(true)
      setIsAudioPlaying(true)
      
      const summaryAudio = `http://localhost:8000${roadmapData.summary_audio_url}`
      
      if (currentAudio) currentAudio.pause()
      const audio = new Audio(summaryAudio)
      setCurrentAudio(audio)
      
      audio.onended = () => {
        setIsAudioPlaying(false)
        setShowSummaryPopup(false)
        navigate('/roadmap', { state: { roadmapData } })
      }
      
      await audio.play()
    } catch (error) {
      console.error('Summary audio failed:', error)
      setShowSummaryPopup(false)
      navigate('/roadmap', { state: { roadmapData } })
    }
  }

  return (
    <>
      <ConversationalWelcome onRoadmapGenerated={handleRoadmapGenerated} />
      <SummaryPopup showSummaryPopup={showSummaryPopup} />
    </>
  )
}

export default WelcomePage