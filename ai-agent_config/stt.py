import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from normalizer import normalizar_texto

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


phrase_list = speechsdk.PhraseListGrammar.from_recognizer(recognizer)

phrase_list.addPhrase("pix")
phrase_list.addPhrase("transferência")
phrase_list.addPhrase("transferir")
phrase_list.addPhrase("enviar dinheiro")
phrase_list.addPhrase("pagamento")
phrase_list.addPhrase("pagar")
phrase_list.addPhrase("reais")


print("🎙️ Fale agora...")
result = recognizer.recognize_once()

if result.reason == speechsdk.ResultReason.RecognizedSpeech:
    texto_bruto = result.text
    print("Texto bruto:", texto_bruto)

    texto_normalizado = normalizar_texto(texto_bruto)
    print("Texto normalizado:", texto_normalizado)

else:
    raise Exception("Erro no reconhecimento de fala")
