import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

load_dotenv()

def falar(texto):
    if not texto:
        return

    try:
        # Pega as chaves dentro da função para garantir que o .env já foi lido
        speech_key = os.getenv("AZURE_SPEECH_KEY")
        service_region = os.getenv("AZURE_REGION")

        if not speech_key or not service_region:
            print("Erro: Chaves de Voz (Speech) não encontradas no .env")
            return

        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
        speech_config.speech_synthesis_voice_name = "pt-BR-FranciscaNeural"
        
        audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
        
        print(f"🔊 Falando: {texto}")
        synthesizer.speak_text_async(texto)
        
    except Exception as e:
        print(f"Erro no TTS: {e}")