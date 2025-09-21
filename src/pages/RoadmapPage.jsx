import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import RoadmapList from '../components/RoadmapList'
import RoadmapDetail from '../components/RoadmapDetail'

const API_BASE = 'http://localhost:8000'

function RoadmapPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [roadmaps, setRoadmaps] = useState([])
  const [selectedRoadmap, setSelectedRoadmap] = useState(null)

  useEffect(() => {
    // Check if roadmap data was passed from welcome session
    if (location.state?.roadmapData) {
      const roadmapData = location.state.roadmapData
      setSelectedRoadmap({
        id: roadmapData.roadmap_id,
        roadmap: roadmapData.roadmap,
        topic: roadmapData.roadmap.topic,
        summary: roadmapData.roadmap.summary || ''
      })
    } else {
      loadRoadmaps()
    }
  }, [location.state])

  const loadRoadmaps = async () => {
    try {
      const response = await axios.get(`${API_BASE}/roadmaps`)
      setRoadmaps(response.data.roadmaps)
    } catch (error) {
      console.error('Loading roadmaps failed:', error)
    }
  }

  const loadRoadmapDetail = async (roadmapId) => {
    try {
      const response = await axios.get(`${API_BASE}/roadmap/${roadmapId}`)
      setSelectedRoadmap(response.data)
    } catch (error) {
      console.error('Loading roadmap detail failed:', error)
    }
  }

  const goToWelcome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {!selectedRoadmap ? (
        <RoadmapList 
          roadmaps={roadmaps}
          loadRoadmapDetail={loadRoadmapDetail}
          goToWelcome={goToWelcome}
        />
      ) : (
        <RoadmapDetail 
          selectedRoadmap={selectedRoadmap}
          setSelectedRoadmap={setSelectedRoadmap}
        />
      )}
    </div>
  )
}

export default RoadmapPage