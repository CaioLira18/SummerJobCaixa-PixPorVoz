import os
import azure.cognitiveservices.speech as speechsdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Importação dos seus módulos locais
from ner import extrair_entidades
from agent import agente_pix
from tts import falar
from normalizer import normalizar_texto

load_dotenv()
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
        speech_key = os.getenv("AZURE_SPEECH_KEY")
        service_region = os.getenv("AZURE_REGION")
        
        if not speech_key or not service_region:
            return {"texto_falado": "", "resposta": "Erro: Chaves não configuradas no .env"}

        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
        speech_config.speech_recognition_language = "pt-BR" 
        
        audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        
        print("🎙️ Ouvindo comando via API...")
        result = recognizer.recognize_once()
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            texto_original = result.text
            texto_limpo = normalizar_texto(texto_original)
            
            entidades = extrair_entidades(texto_limpo)
            
            resposta_agente = agente_pix(texto_limpo, entidades)
            
            falar(resposta_agente) 

            return {
                "texto_falado": texto_original,
                "resposta": resposta_agente
            }
        
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return {"texto_falado": "", "resposta": "Não consegui ouvir nada. Tente falar novamente."}
        else:
            return {"texto_falado": "", "resposta": "Erro no reconhecimento de voz."}

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return {"texto_falado": "Erro", "resposta": str(e)}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Servidor Python rodando em http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)