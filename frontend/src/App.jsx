import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ResultCard from "./components/ResultCard";
import VoiceMemo from "./components/VoiceMemo";

const MODES = { SELECT: "select", UPLOAD: "upload", MEMO: "memo" };

export default function App() {
  const [mode, setMode] = useState(MODES.SELECT);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  function handleResult(data) {
    setResult(data);
  }

  function reset() {
    setResult(null);
    setMode(MODES.SELECT);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Sales Call Transcriber</h1>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Result view */}
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <ResultCard result={result} onReset={reset} />
            </div>
          ) : (
            <>
              {/* Mode selector */}
              {mode === MODES.SELECT && (
                <div className="space-y-4">
                  <p className="text-center text-gray-500 text-sm mb-8">
                    Choose how you'd like to add a call
                  </p>

                  <button
                    onClick={() => setMode(MODES.UPLOAD)}
                    className="w-full p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm text-left transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <UploadIcon />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Upload Call Recording</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          MP3, MP4, WAV, or M4A — up to 4.5MB
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMode(MODES.MEMO)}
                    className="w-full p-6 rounded-2xl bg-white border border-gray-200 hover:border-red-400 hover:shadow-sm text-left transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                        <MicIcon />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Post-Call Voice Memo</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Record your thoughts right after the call
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Upload mode */}
              {mode === MODES.UPLOAD && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setMode(MODES.SELECT)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ←
                    </button>
                    <h2 className="font-semibold text-gray-900">Upload Call Recording</h2>
                  </div>
                  <FileUpload onResult={handleResult} />
                </div>
              )}

              {/* Memo mode */}
              {mode === MODES.MEMO && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setMode(MODES.SELECT)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ←
                    </button>
                    <h2 className="font-semibold text-gray-900">Post-Call Voice Memo</h2>
                  </div>
                  <VoiceMemo onResult={handleResult} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M9 11V7a3 3 0 016 0v4a3 3 0 01-6 0z" />
    </svg>
  );
}
