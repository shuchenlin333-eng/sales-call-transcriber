from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.claude import analyze_memo
from app.services.whisper import transcribe_audio

router = APIRouter()

MAX_FILE_SIZE = 4.5 * 1024 * 1024  # 4.5MB — Vercel request body limit


@router.post("/memo")
async def voice_memo(file: UploadFile = File(...)):
    """
    Accept a short voice memo recording, transcribe it, and return analysis.
    Single speaker — no diarization. Optimized for post-call rep thoughts.
    """
    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Memo too large. Maximum size is 25MB.")

    if not file_bytes:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    try:
        transcription = await transcribe_audio(file_bytes, file.filename or "memo.webm")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        analysis = await analyze_memo(
            transcription["transcript"],
            transcription.get("duration_seconds"),
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return {
        "transcript": transcription["transcript"],
        "duration_seconds": transcription.get("duration_seconds"),
        **analysis,
    }
