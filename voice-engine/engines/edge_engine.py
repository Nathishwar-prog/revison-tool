import edge_tts
import os

async def generate_audio_edge(text: str, voice: str, rate: str, pitch: str, output_file: str) -> str:
    """
    Generates audio using MS Edge TTS.
    Returns the path to the generated file.
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_file)
    return output_file
