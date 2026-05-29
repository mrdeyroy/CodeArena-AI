from __future__ import annotations

from app.schemas.schemas import TranscribeRequest, TranscribeResponse, SpeakRequest, SpeakResponse


class SpeechService:
    """Abstraction for speech-to-text and text-to-speech. Swap provider later."""

    async def transcribe(self, request: TranscribeRequest) -> TranscribeResponse:
        # Placeholder — integrate with OpenAI Whisper, Deepgram, or similar
        return TranscribeResponse(text="[transcription placeholder]")

    async def speak(self, request: SpeakRequest) -> SpeakResponse:
        # Placeholder — integrate with OpenAI TTS, ElevenLabs, or similar
        return SpeakResponse(audio_url="[audio placeholder]")


speech_service = SpeechService()
