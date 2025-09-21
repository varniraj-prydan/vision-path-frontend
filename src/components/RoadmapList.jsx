function RoadmapList({ roadmaps, loadRoadmapDetail, goToWelcome }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Learning Roadmaps</h1>
      <div className="grid gap-4">
        {roadmaps.map((roadmap) => (
          <div 
            key={roadmap.id} 
            className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => loadRoadmapDetail(roadmap.id)}
          >
            <h3 className="text-xl font-semibold mb-2">{roadmap.topic}</h3>
            <p className="text-gray-300 mb-2">{roadmap.description}</p>
            <p className="text-sm text-gray-400">
              Created: {new Date(roadmap.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <button 
        onClick={goToWelcome}
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Create New Roadmap
      </button>
    </div>
  )
}

export default RoadmapList