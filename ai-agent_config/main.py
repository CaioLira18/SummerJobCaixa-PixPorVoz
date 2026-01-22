from ner import extrair_entidades
from agent import agente_pix
from tts import falar
import azure.cognitiveservices.speech as speechsdk
import os
from dotenv import load_dotenv

load_dotenv()

speech_config = speechsdk.SpeechConfig(
    subscription=os.getenv("AZURE_AI_KEY"),
    region=os.getenv("AZURE_REGION")
)
speech_config.speech_recognition_language = "pt-BR"

recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config)

print("🎙️ Fale o comando PIX...")
result = recognizer.recognize_once()

texto = result.text
print("Texto:", texto)

entidades = extrair_entidades(texto)
print("Entidades:", entidades)

resposta = agente_pix(texto, entidades)
print("Resposta:", resposta)

falar(resposta)
