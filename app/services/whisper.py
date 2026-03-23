import os
import tempfile
from pathlib import Path

from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])

SUPPORTED_FORMATS = {".mp3", ".mp4", ".wav", ".m4a", ".mpeg", ".mpga", ".webm"}


async def transcribe_audio(file_bytes: bytes, filename: str) -> dict:
    """
    Transcribe audio bytes using OpenAI Whisper.
    Returns dict with 'transcript' and 'duration_seconds'.
    Raises ValueError if format is unsupported or transcription fails.
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported file format '{suffix}'. Supported: {', '.join(SUPPORTED_FORMATS)}"
        )

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=(filename, audio_file, _mime_type(suffix)),
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )

        transcript = response.text.strip()
        if not transcript:
            raise ValueError("Whisper returned an empty transcript. Audio may be silent or unclear.")

        duration = getattr(response, "duration", None)
        return {"transcript": transcript, "duration_seconds": duration}

    finally:
        os.unlink(tmp_path)


def _mime_type(suffix: str) -> str:
    mime_map = {
        ".mp3": "audio/mpeg",
        ".mp4": "audio/mp4",
        ".m4a": "audio/mp4",
        ".wav": "audio/wav",
        ".mpeg": "audio/mpeg",
        ".mpga": "audio/mpeg",
        ".webm": "audio/webm",
    }
    return mime_map.get(suffix, "application/octet-stream")
