import os
import uuid
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from elevenlabs.client import ElevenLabs

from normalizer import normalizar_texto

# =========================
# CONFIGURAÇÕES INICIAIS
# =========================
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API")
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")

client_groq = Groq(api_key=GROQ_API_KEY)
client_eleven = ElevenLabs(api_key=ELEVEN_API_KEY)

app = FastAPI(title="Pix Voice - Fix")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComandoVoz(BaseModel):
    texto: str
    historico: list = []
    contatos_validos: list = []

# =========================
# LÓGICA DE EXTRAÇÃO E IA
# =========================
def gerar_conversa_ia(texto_usuario, contatos_validos):
    texto_lower = texto_usuario.lower()
    
    # 1. Identificar o destinatário (Busca por nome nos favoritos)
    contato_mencionado = None
    for contato in contatos_validos:
        # Busca o nome como palavra inteira para evitar falsos positivos
        if re.search(rf'\b{re.escape(contato.lower())}\b', texto_lower):
            contato_mencionado = contato
            break

    if not contato_mencionado:
        return {
            "texto": "Para quem você deseja enviar? Por segurança, escolha um de seus contatos favoritos.",
            "status": "BLOCKED",
            "valor": None,
            "destinatario": None
        }

    # 2. Extrair o valor (Regex para números com vírgula ou ponto)
    # Captura formatos como "10", "10,50", "10.00"
    valores = re.findall(r'\d+(?:[.,]\d+)?', texto_lower)
    
    if not valores:
        return {
            "texto": f"Qual o valor do Pix que você deseja enviar para {contato_mencionado}?",
            "status": "MISSING_INFO",
            "valor": None,
            "destinatario": contato_mencionado
        }
    
    valor_extraido = valores[0].replace(',', '.')

    # 3. Retorno com Status de Autenticação para o React
    return {
        "texto": f"Certo! Identifiquei um Pix de R$ {valor_extraido} para {contato_mencionado}. Por favor, confirme com sua biometria.",
        "status": "REQUIRE_AUTH",
        "valor": valor_extraido,
        "destinatario": contato_mencionado
    }

# =========================
# ENDPOINTS
# =========================
@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        # IMPORTANTE: Usamos o texto bruto (comando.texto) para a extração
        # A normalização pode remover números ou alterar nomes próprios.
        resultado = gerar_conversa_ia(comando.texto, comando.contatos_validos)

        # Gerar o áudio com a resposta da IA
        arquivo_audio = f"resposta_{uuid.uuid4().hex}.mp3"
        audio_stream = client_eleven.text_to_speech.convert(
            voice_id="EXAVITQu4vr4xnSDxMaL",
            model_id="eleven_multilingual_v2",
            text=resultado["texto"]
        )

        with open(arquivo_audio, "wb") as f:
            for chunk in audio_stream:
                if chunk: f.write(chunk)

        return {
            "texto_falado": comando.texto,
            "resposta": resultado["texto"],
            "status": resultado["status"],
            "valor": resultado["valor"], # Necessário para o modal do React
            "destinatario": resultado["destinatario"], # Necessário para o modal do React
            "audio_url": f"/audio/{arquivo_audio}"
        }

    except Exception as e:
        print(f"Erro: {e}")
        return {"resposta": "Erro ao processar comando.", "status": "ERROR"}

@app.get("/audio/{nome_arquivo}")
def get_audio(nome_arquivo: str):
    return FileResponse(nome_arquivo, media_type="audio/mpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)