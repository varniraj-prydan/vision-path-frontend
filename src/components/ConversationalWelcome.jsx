import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

function ConversationalWelcome({ onRoadmapGenerated }) {
  const [guestId, setGuestId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [recordingState, setRecordingState] = useState('idle') // 'idle', 'ready', 'recording', 'processing'
  const mediaRecorderRef = useRef(null)
  const recordingStartTime = useRef(null)

  useEffect(() => {
    // Add keyboard listener for Enter key
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleEnterPress()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [recordingState, isAudioPlaying, sessionStarted, isRecording])

  const handleEnterPress = () => {
    if (!sessionStarted) {
      startWelcomeSession()
    } else if (!isAudioPlaying && !isGeneratingRoadmap) {
      if (isRecording) {
        stopRecording()
      } else if (recordingState === 'ready') {
        startRecording()
      }
    }
  }

  const startWelcomeSession = async () => {
    try {
      setSessionStarted(true)
      const response = await axios.post(`${API_BASE}/welcome/start`)
      setGuestId(response.data.guest_id)
      
      // Add accessibility guidance
      const guidanceMessage = "Welcome to Vision Path! After each message, press Enter to start recording your response, then press Enter again to stop recording. Let me start with the welcome message."
      
      const welcomeMessage = {
        role: 'assistant',
        content: response.data.message,
        audio_url: response.data.audio_url,
        timestamp: new Date().toISOString()
      }
      
      setChatHistory([welcomeMessage])
      
      // Play welcome message directly
      playAudio(response.data.audio_url)
    } catch (error) {
      console.error('Failed to start welcome session:', error)
    }
  }



  const announceRecordingReady = () => {
    // Screen reader announcement
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.textContent = 'Press Enter to start recording your response'
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  const playAudio = async (audioUrl) => {
    try {
      setIsAudioPlaying(true)
      if (currentAudio) currentAudio.pause()
      
      const audio = new Audio(`${API_BASE}${audioUrl}`)
      setCurrentAudio(audio)
      
      audio.onended = () => {
        setIsAudioPlaying(false)
        setRecordingState('ready')
        announceRecordingReady()
      }
      await audio.play()
    } catch (error) {
      console.error('Audio playback failed:', error)
      setIsAudioPlaying(false)
      setRecordingState('ready')
    }
  }

  const startRecording = async () => {
    try {
      setRecordingState('recording')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      
      const chunks = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const recordingDuration = Date.now() - recordingStartTime.current
        if (recordingDuration >= 500) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' })
          sendAudio(audioBlob)
        } else {
          setRecordingState('ready')
          announceRecordingReady()
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      recordingStartTime.current = Date.now()
      
      // Announce recording started
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.textContent = 'Recording started. Press Enter again to stop recording.'
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
      
    } catch (error) {
      console.error('Recording failed:', error)
      setRecordingState('ready')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setRecordingState('processing')
      
      // Announce recording stopped
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.textContent = 'Recording stopped. Processing your response...'
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    }
  }

  const sendAudio = async (audioBlob) => {
    try {
      // First transcribe the audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const transcriptResponse = await axios.post(`${API_BASE}/capture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const userInput = transcriptResponse.data.transcript
      
      // Add user message to chat
      const userMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString()
      }
      setChatHistory(prev => [...prev, userMessage])
      
      // Send to welcome chat endpoint
      const chatResponse = await axios.post(`${API_BASE}/welcome/chat`, {
        guest_id: guestId,
        user_input: userInput
      })
      
      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: chatResponse.data.response,
        audio_url: chatResponse.data.audio_url,
        ready_to_generate: chatResponse.data.ready_to_generate,
        learning_summary: chatResponse.data.learning_summary,
        timestamp: new Date().toISOString()
      }
      setChatHistory(prev => [...prev, aiMessage])
      
      // Play AI response audio
      playAudio(chatResponse.data.audio_url)
      
      // Check if ready to generate roadmap
      if (chatResponse.data.ready_to_generate && chatResponse.data.learning_summary) {
        setTimeout(() => {
          generateRoadmap(chatResponse.data.learning_summary)
        }, 2000) // Wait 2 seconds after audio finishes
      }
      
    } catch (error) {
      console.error('Audio processing failed:', error)
    }
  }

  const generateRoadmap = async (learningSummary) => {
    try {
      setIsGeneratingRoadmap(true)
      const response = await axios.post(`${API_BASE}/welcome/generate-roadmap`, {
        learning_summary: learningSummary
      })
      
      onRoadmapGenerated(response.data)
    } catch (error) {
      console.error('Roadmap generation failed:', error)
      setIsGeneratingRoadmap(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Vision Path</h1>
        
        {/* Chat History */}
        {/* Screen reader instructions */}
        <div className="sr-only" aria-live="polite">
          {!sessionStarted && "Vision Path accessible learning platform. Made for blind people. Press Enter to start the welcome session. Use Enter key to start and stop recording during conversation."}
          {recordingState === 'ready' && !isRecording && "Press Enter to start recording"}
          {isRecording && "Press Enter to stop recording"}
          {recordingState === 'processing' && "Processing your response..."}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
          {!sessionStarted ? (
            <div className="text-center text-gray-300">
              <h2 className="text-2xl mb-6">Vision Path - Accessible Learning</h2>
              
              <div className="bg-blue-900 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-4 text-blue-200">Made for Blind People</h3>
                <p className="mb-4 text-blue-100">
                  If you are helping a blind person, please note:
                </p>
                <ul className="text-left text-blue-100 mb-4 space-y-2">
                  <li>• Use <strong>Enter key</strong> to start and stop conversations</li>
                  <li>• Press Enter once to start recording</li>
                  <li>• Press Enter again to stop recording</li>
                  <li>• Audio will play automatically after each response</li>
                </ul>
                <div className="bg-blue-800 p-4 rounded mb-4">
                  <p className="text-blue-200 font-semibold mb-2">Watch Tutorial Video:</p>
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <p className="text-gray-300 text-sm">[Tutorial video placeholder]</p>
                    <p className="text-gray-400 text-xs mt-1">Video showing how to use Enter key controls</p>
                  </div>
                </div>
              </div>
              
              <p className="mb-4 text-lg font-semibold">Press Enter to start your learning journey</p>
              <p className="text-sm text-gray-400">Fully keyboard accessible interface</p>
            </div>
          ) : (
            chatHistory.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-xs ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.learning_summary && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      message.ready_to_generate 
                        ? 'bg-green-800' 
                        : 'bg-yellow-800'
                    }`}>
                      <p className={message.ready_to_generate ? 'text-green-200' : 'text-yellow-200'}>
                        {message.ready_to_generate ? 'Creating roadmap...' : 'Information collected'}
                      </p>
                      <p className={message.ready_to_generate ? 'text-green-100' : 'text-yellow-100'}>
                        {message.learning_summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Instructions */}
        {sessionStarted && !isGeneratingRoadmap && (
          <div className="text-center">
            <div className={`px-8 py-4 text-xl font-bold rounded-full ${
              isRecording 
                ? 'bg-red-600 animate-pulse' 
                : recordingState === 'ready'
                  ? 'bg-green-600'
                  : recordingState === 'processing'
                    ? 'bg-yellow-600'
                    : 'bg-gray-600'
            }`}>
              {isRecording && '🔴 Recording... (Press Enter to stop)'}
              {!isRecording && recordingState === 'ready' && '🎤 Press Enter to start recording'}
              {recordingState === 'processing' && '⏳ Processing your response...'}
              {recordingState === 'idle' && '🔊 Listening to response...'}
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Keyboard accessible: Use Enter key to control recording
            </p>
          </div>
        )}

        {/* Generating Roadmap */}
        {isGeneratingRoadmap && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg" aria-live="polite">Generating your personalized roadmap...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationalWelcome