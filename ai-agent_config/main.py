import os
import azure.cognitiveservices.speech as speechsdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Importação dos novos módulos de IA
from brain import extrair_dados_com_ia
from agent import agente_pix_ia
from tts import falar
from normalizer import normalizar_texto

load_dotenv()

# Validação de credenciais de Voz
try:
    SPEECH_KEY = os.environ["AZURE_SPEECH_KEY"]
    SPEECH_REGION = os.environ["AZURE_REGION"]
except KeyError as e:
    raise RuntimeError(f"Erro no .env: Variável {e} não encontrada.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ouvir")
def ouvir_comando():
    try:
        speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
        speech_config.speech_recognition_language = "pt-BR" 
        audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        
        print("🎙️ Ouvindo...")
        result = recognizer.recognize_once()
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            texto_original = result.text
            
            # 1. IA extrai os dados (brain.py)
            dados_extraidos = extrair_dados_com_ia(texto_original)
            
            # 2. Agente formata a resposta (agent.py)
            resultado = agente_pix_ia(dados_extraidos)
            
            # 3. Fala a confirmação
            falar(resultado["resposta"]) 

            return {
                "texto_falado": texto_original,
                "resposta": resultado["resposta"],
                "Nome": resultado["destinatario"],
                "Valor": resultado["valor"],
                "Data": resultado["data"]
            }
        
        return {"texto_falado": "", "resposta": "Não consegui ouvir nada."}

    except Exception as e:
        print(f"Erro: {e}")
        return {"texto_falado": "Erro", "resposta": str(e)}