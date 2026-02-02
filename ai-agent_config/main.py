# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from brain import processar_comando
from stt import capturar_voz # Importa sua função

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/voice")
def voice_command():
    # 1. Aciona o seu script de STT
    texto_ouvido = capturar_voz()
    
    if not texto_ouvido:
        return {"success": False, "message": "Não consegui ouvir o comando."}
    
    # 2. Processa o texto normalizado pelo seu brain.py
    resultado = processar_comando(texto_ouvido)
    
    # Adicionamos o que foi ouvido para você debugar no terminal
    resultado["texto_falado"] = texto_ouvido 
    return resultado