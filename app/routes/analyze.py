from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeRequest
from app.services.claude import analyze_transcript

router = APIRouter()


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """
    Accept a transcript string and return structured analysis + Salesforce-ready payload.
    """
    if not request.transcript.strip():
        raise HTTPException(status_code=422, detail="Transcript cannot be empty.")

    try:
        result = await analyze_transcript(request.transcript, request.duration_seconds)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return result
