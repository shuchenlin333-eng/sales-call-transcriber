import { useEffect, useRef, useState } from "react";
import { submitMemo } from "../api";

const STATES = { IDLE: "idle", RECORDING: "recording", PAUSED: "paused", DONE: "done" };

export default function VoiceMemo({ onResult }) {
  const [recState, setRecState] = useState(STATES.IDLE);
  const [seconds, setSeconds] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  async function startRecording() {
    setError(null);
    setAudioURL(null);
    chunksRef.current = [];
    blobRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Waveform setup
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      drawWaveform();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        setAudioURL(URL.createObjectURL(blob));
        setRecState(STATES.DONE);
        cancelAnimationFrame(animFrameRef.current);
        clearCanvas();
      };

      recorder.start();
      setRecState(STATES.RECORDING);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  }

  function pauseRecording() {
    mediaRecorderRef.current?.pause();
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setRecState(STATES.PAUSED);
  }

  function resumeRecording() {
    mediaRecorderRef.current?.resume();
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    drawWaveform();
    setRecState(STATES.RECORDING);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
  }

  function reRecord() {
    setRecState(STATES.IDLE);
    setSeconds(0);
    setAudioURL(null);
    blobRef.current = null;
  }

  function drawWaveform() {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#3b82f6";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    draw();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw flat line
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  async function handleSubmit() {
    if (!blobRef.current) return;
    setError(null);
    setLoading(true);
    try {
      const result = await submitMemo(blobRef.current);
      onResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        className="w-full rounded-xl bg-gray-50 border border-gray-200"
      />

      {/* Timer */}
      <div className="text-center font-mono text-3xl text-gray-700 tabular-nums">
        {formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {recState === STATES.IDLE && (
          <button
            onClick={startRecording}
            className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-lg flex items-center gap-2 transition-colors"
          >
            <span className="w-3 h-3 rounded-full bg-white inline-block" />
            Record
          </button>
        )}

        {recState === STATES.RECORDING && (
          <>
            <button
              onClick={pauseRecording}
              className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              Pause
            </button>
            <button
              onClick={stopRecording}
              className="px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors"
            >
              Stop
            </button>
          </>
        )}

        {recState === STATES.PAUSED && (
          <>
            <button
              onClick={resumeRecording}
              className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
            >
              Resume
            </button>
            <button
              onClick={stopRecording}
              className="px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors"
            >
              Stop
            </button>
          </>
        )}

        {recState === STATES.DONE && (
          <button
            onClick={reRecord}
            className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            Re-record
          </button>
        )}
      </div>

      {/* Playback */}
      {audioURL && (
        <audio controls src={audioURL} className="w-full" />
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {recState === STATES.DONE && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing…" : "Submit Memo"}
        </button>
      )}
    </div>
  );
}
