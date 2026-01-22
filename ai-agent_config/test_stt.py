import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

load_dotenv()

speech_config = speechsdk.SpeechConfig(
    subscription=os.getenv("AZURE_AI_KEY"),
    region=os.getenv("AZURE_REGION")
)
speech_config.speech_recognition_language = "pt-BR"

audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
recognizer = speechsdk.SpeechRecognizer(
    speech_config=speech_config,
    audio_config=audio_config
)

print("🎙️ Fale algo...")
result = recognizer.recognize_once()

print("Resultado:", result.reason)
print("Texto:", result.text)