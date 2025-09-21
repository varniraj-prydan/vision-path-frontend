function RoadmapDetail({ selectedRoadmap, setSelectedRoadmap }) {
  return (
    <div>
      <button 
        onClick={() => setSelectedRoadmap(null)}
        className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
      >
        ← Back to Roadmaps
      </button>
      
      <h1 className="text-3xl font-bold mb-2">{selectedRoadmap.topic}</h1>
      <p className="text-gray-300 mb-6">{selectedRoadmap.description}</p>
      
      <div className="space-y-4">
        {selectedRoadmap.roadmap.days.map((day, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">
              Day {day.day}: {day.title}
            </h3>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Tasks:</h4>
              <ul className="space-y-1">
                {day.tasks.map((task, i) => (
                  <li key={i} className="ml-4 text-gray-300">• {task}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Lesson:</h4>
              <p className="text-gray-300">{day.lesson}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoadmapDetail