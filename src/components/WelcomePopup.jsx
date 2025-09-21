function WelcomePopup({ showWelcomePopup, userInteracted, isAudioPlaying, handleStartClick }) {
  if (!showWelcomePopup) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Welcome to Vision Path</h2>
        {!userInteracted ? (
          <>
            <p className="text-lg mb-6">Click to start your learning journey</p>
            <button 
              onClick={handleStartClick}
              className="px-8 py-4 text-xl font-bold bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              🚀 Start
            </button>
          </>
        ) : (
          <>
            <p className="text-lg mb-4">{isAudioPlaying ? '🎵 Playing welcome message...' : '⏳ Loading welcome message...'}</p>
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto"></div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WelcomePopup