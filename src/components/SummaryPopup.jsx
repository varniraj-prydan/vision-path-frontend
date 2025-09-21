function SummaryPopup({ showSummaryPopup }) {
  if (!showSummaryPopup) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Roadmap Created!</h2>
        <p className="text-lg mb-4">🎵 Playing roadmap summary...</p>
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export default SummaryPopup