from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.whisper import transcribe_audio

router = APIRouter()

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Accept an audio file and return the transcript with timestamps.
    Supported formats: MP3, MP4, WAV, M4A
    """
    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 100MB.")

    if not file_bytes:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    try:
        result = await transcribe_audio(file_bytes, file.filename or "audio.mp3")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return result
