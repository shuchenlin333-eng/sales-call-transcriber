import { useRef, useState } from "react";
import { analyzeTranscript, transcribeFile } from "../api";

const ACCEPTED = ".mp3,.mp4,.wav,.m4a";
const MAX_MB = 4.5;

export default function FileUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }

  function validateAndSet(f) {
    setError(null);
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
  }

  async function handleSubmit() {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const { transcript, duration_seconds } = await transcribeFile(file);
      const analysis = await analyzeTranscript(transcript, duration_seconds);
      onResult({ transcript, ...analysis });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files[0] && validateAndSet(e.target.files[0])}
        />
        {file ? (
          <div>
            <p className="text-gray-800 font-medium">{file.name}</p>
            <p className="text-gray-500 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500">Drag & drop or click to upload</p>
            <p className="text-gray-400 text-sm mt-1">MP3, MP4, WAV, M4A — max {MAX_MB}MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Processing…" : "Transcribe & Analyze"}
      </button>
    </div>
  );
}
