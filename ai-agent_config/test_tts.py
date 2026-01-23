import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

load_dotenv()

speech_config = speechsdk.SpeechConfig(
    subscription=os.getenv("AZURE_AI_KEY"),
    region=os.getenv("AZURE_REGION")
)
speech_config.speech_synthesis_voice_name = "pt-BR-FranciscaNeural"

synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)

synthesizer.speak_text_async(
    "Olá, seu serviço de voz está funcionando corretamente."
)
