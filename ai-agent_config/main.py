import os
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from elevenlabs.client import ElevenLabs

from normalizer import normalizar_texto

# =========================
# CARREGAR VARIÁVEIS .ENV
# =========================
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API")
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")

MODEL_ID = "llama-3.3-70b-versatile"

# =========================
# CLIENTES
# =========================
client_groq = Groq(api_key=GROQ_API_KEY)
client_eleven = ElevenLabs(api_key=ELEVEN_API_KEY)

# =========================
# APP FASTAPI
# =========================
app = FastAPI(title="Pix Voice - Groq + ElevenLabs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODELO DE DADOS
# =========================
class ComandoVoz(BaseModel):
    texto: str
    historico: list = []
    contatos_validos: list = []

# =========================
# IA DE CONVERSA
# =========================
def gerar_conversa_ia(texto_usuario, historico_anterior, contatos_validos):

    texto_lower = texto_usuario.lower()
    contatos_lower = [c.lower() for c in contatos_validos]

    contato_mencionado = None
    for contato in contatos_lower:
        if contato in texto_lower:
            contato_mencionado = contato
            break

    if not contato_mencionado:
        return {
            "texto": "Por segurança, você só pode enviar Pix para contatos favoritos cadastrados no aplicativo.",
            "status": "BLOCKED"
        }

    return {
        "texto": f"Pix enviado com sucesso para {contato_mencionado.capitalize()}.",
        "status": "COMPLETED"
    }

# =========================
# GERAR ÁUDIO ELEVENLABS
# =========================
def gerar_audio_eleven(texto):

    audio_stream = client_eleven.text_to_speech.convert(
        voice_id="EXAVITQu4vr4xnSDxMaL",
        model_id="eleven_multilingual_v2",
        text=texto
    )

    nome_arquivo = f"resposta_{uuid.uuid4().hex}.mp3"

    with open(nome_arquivo, "wb") as f:
        for chunk in audio_stream:
            if chunk:
                f.write(chunk)

    return nome_arquivo

# =========================
# ENDPOINT PRINCIPAL
# =========================
@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):

    try:
        texto_limpo = normalizar_texto(comando.texto)

        resultado = gerar_conversa_ia(
            texto_limpo,
            comando.historico,
            comando.contatos_validos
        )

        arquivo_audio = gerar_audio_eleven(resultado["texto"])

        return {
            "texto_falado": comando.texto,
            "resposta": resultado["texto"],
            "status": resultado["status"],
            "audio_url": f"/audio/{arquivo_audio}"
        }

    except Exception as e:
        print(f"Erro: {e}")
        return {
            "resposta": "Erro ao processar o comando de voz.",
            "status": "ERROR"
        }

# =========================
# ROTA PARA SERVIR ÁUDIO
# =========================
@app.get("/audio/{nome_arquivo}")
def get_audio(nome_arquivo: str):
    return FileResponse(nome_arquivo, media_type="audio/mpeg")

# =========================
# EXECUTAR SERVIDOR
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)