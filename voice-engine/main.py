from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import hashlib
from engines.edge_engine import generate_audio_edge
from engines.gtts_engine import generate_audio_gtts

app = FastAPI(
    title="Viva Voce AI Engine",
    description="Production-grade Neural Voice Microservice for Knowledge Garden",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration & Constants
AUDIO_CACHE_DIR = "cache/audio"
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)

class VoiceRequest(BaseModel):
    text: str
    emotion: str = "neutral"
    personality: str = "tutor"
    speed: str = "normal"
    tone: str = "warm"

# Voice Persona Mapping (Edge-TTS Voices)
# We use standard Microsoft/Edge voices that are reliably English (en-US)
VOICE_MAP = {
    "tutor": "en-US-AriaNeural",          # Standard, clear, professional AI
    "mentor": "en-US-GuyNeural",          # Clear male voice
    "friend": "en-US-AnaNeural",          # Friendly female
    "teacher": "en-US-RogerNeural",       # Gentle male
    "coach": "en-US-AndrewNeural"         # Firm male
}

# Speed Control
SPEED_MAP = {
    "slow": "-10%",
    "normal": "+0%",
    "fast": "+10%"
}

# Pitch Control (Simulating Tone)
PITCH_MAP = {
    "warm": "-2Hz",
    "neutral": "+0Hz",
    "soft": "+2Hz"
}

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "system": "Viva Voce AI Engine",
        "engines": ["Google TTS (Primary)"]
    }

@app.post("/voice/viva-voce")
async def generate_viva_speech(request: VoiceRequest):
    """
    Core endpoint for generating soulful AI speech.
    """
    # 1. Resolve Voice Parameters
    voice_id = VOICE_MAP.get(request.personality, "en-US-AriaNeural")
    rate = SPEED_MAP.get(request.speed, "+0%")
    pitch = PITCH_MAP.get(request.tone, "+0Hz")

    # 2. Caching Strategy
    param_str = f"{request.text}-{voice_id}-{rate}-{pitch}"
    file_hash = hashlib.md5(param_str.encode()).hexdigest()
    filename = f"{file_hash}.mp3"
    filepath = os.path.join(AUDIO_CACHE_DIR, filename)

    # 3. Serve cached if available
    if os.path.exists(filepath):
        print(f"Serving cached audio: {filename}")
        return FileResponse(filepath, media_type="audio/mpeg", filename="speech.mp3")

    # 4. Try Google TTS (Primary - as requested)
    try:
        print(f"Generating with gTTS (Primary): {filename}")
        await generate_audio_gtts(request.text, filepath)
        return FileResponse(filepath, media_type="audio/mpeg", filename="speech.mp3")
    except Exception as e:
        print(f"gTTS Failed ({str(e)}). Giving up.")
        raise HTTPException(status_code=500, detail=f"Voice Generation Failed: {str(e)}")

    # Edge-TTS removed as per user request to avoid 403 errors.
    # Fallback is handled by Frontend (Browser Voice).

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
