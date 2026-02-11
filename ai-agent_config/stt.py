# stt.py
import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from normalizer import normalizar_texto

load_dotenv()

def capturar_voz():
    # Usando AZURE_SPEECH_KEY conforme seu .env
    speech_config = speechsdk.SpeechConfig(
        subscription=os.getenv("AZURE_SPEECH_KEY"), 
        region=os.getenv("AZURE_REGION")
    )
    speech_config.speech_recognition_language = "pt-BR"
    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    # Sua lista de frases para melhorar a precisão
    phrase_list = speechsdk.PhraseListGrammar.from_recognizer(recognizer)
    phrase_list.addPhrase("pix")
    phrase_list.addPhrase("reais")

    print("🎙️ Ouvindo comando do usuário...")
    result = recognizer.recognize_once()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return normalizar_texto(result.text)
    return None