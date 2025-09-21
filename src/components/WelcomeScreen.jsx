function WelcomeScreen({ 
  transcript, 
  isAudioPlaying, 
  isRecording, 
  startRecording, 
  stopRecording 
}) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Vision Path</h1>
      <div className="bg-gray-800 p-8 rounded-lg max-w-md mx-auto">
        <p className="text-lg mb-6">Tell me your learning goal...</p>
        {transcript && (
          <div className="mb-4 p-4 bg-gray-700 rounded">
            <p className="text-sm text-gray-300">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            if (!isAudioPlaying && !isRecording) {
              startRecording()
            }
          }}
          onMouseUp={(e) => {
            e.preventDefault()
            if (isRecording) {
              stopRecording()
            }
          }}
          onMouseLeave={(e) => {
            e.preventDefault()
            if (isRecording) {
              stopRecording()
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            if (!isAudioPlaying && !isRecording) {
              startRecording()
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            if (isRecording) {
              stopRecording()
            }
          }}
          disabled={isAudioPlaying}
          className={`px-8 py-4 text-xl font-bold rounded-full select-none ${
            isAudioPlaying 
              ? 'bg-gray-600 cursor-not-allowed' 
              : isRecording 
                ? 'bg-red-600 animate-pulse' 
                : 'bg-green-600 hover:bg-green-700'
          }`}
          aria-label={isAudioPlaying ? 'Please wait for audio to finish' : isRecording ? 'Recording... Release to send' : 'Hold to record voice'}
        >
          {isAudioPlaying ? '🔊 Audio Playing...' : isRecording ? '🔴 Recording...' : '🎤 Hold to Speak'}
        </button>
        <p className="mt-2 text-sm text-yellow-400">
          Hold for at least 1 second to record
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Say "repeat" anytime to replay the last audio
        </p>
      </div>
    </div>
  )
}

export default WelcomeScreen