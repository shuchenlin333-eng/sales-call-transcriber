const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function transcribeFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE_URL}/transcribe`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Transcription failed." }));
    throw new Error(err.detail || "Transcription failed.");
  }
  return res.json();
}

export async function analyzeTranscript(transcript, duration_seconds) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, duration_seconds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }
  return res.json();
}

export async function submitMemo(blob) {
  const form = new FormData();
  form.append("file", blob, "memo.webm");

  const res = await fetch(`${BASE_URL}/memo`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Memo processing failed." }));
    throw new Error(err.detail || "Memo processing failed.");
  }
  return res.json();
}
