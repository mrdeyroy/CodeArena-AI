from fastapi import APIRouter, HTTPException

from app.schemas.schemas import TranscribeRequest, TranscribeResponse, SpeakRequest, SpeakResponse
from app.services.speech import speech_service

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(request: TranscribeRequest):
    return await speech_service.transcribe(request)


@router.post("/speak", response_model=SpeakResponse)
async def speak(request: SpeakRequest):
    return await speech_service.speak(request)
