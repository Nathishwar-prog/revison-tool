from gtts import gTTS
import os
import asyncio

async def generate_audio_gtts(text: str, output_file: str) -> str:
    """
    Generates audio using Google TTS (Fallback).
    Returns the path to the generated file.
    Runs in an executor to avoid blocking the async loop.
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    def _generate():
        tts = gTTS(text, lang='en', tld='us')
        tts.save(output_file)

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _generate)
    
    return output_file
