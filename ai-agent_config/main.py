import os
import uuid
import re
import json
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

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
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
    MODELO_ATUAL = "llama-3.1-8b-instant"

    prompt_sistema = f"""
    Você é um extrator de dados para um sistema de PIX por voz.
    Sua missão é identificar o VALOR e o DESTINATÁRIO.

    LISTA DE CONTATOS PERMITIDOS: {", ".join(contatos_validos)}

    REGRAS CRÍTICAS:
    1. O destinatário DEVE ser um dos nomes da lista acima. Se o usuário disser um nome parecido (ex: 'Bia' para 'Beatriz'), use o nome EXATO da lista.
    2. Se o nome não estiver na lista ou não for mencionado, retorne status "BLOCKED".
    3. Se o valor não for encontrado, retorne status "MISSING_INFO".
    4. Se tudo estiver correto, retorne status "CONFIRM".

    RETORNE APENAS JSON no formato:
    {{
      "valor": float ou null,
      "destinatario": "string" ou null,
      "status": "string",
      "texto": "Uma frase curta de resposta para o usuário"
    }}
    """

    try:
        chat_completion = client_groq.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": texto_usuario}
            ],
            model=MODELO_ATUAL,
            response_format={"type": "json_object"}
        )

        return json.loads(chat_completion.choices[0].message.content)

    except Exception as e:
        print(f"Erro na Groq: {e}")
        return {
            "texto": "Houve um erro técnico ao processar sua voz.",
            "status": "ERROR",
            "valor": None,
            "destinatario": None
        }

# =========================
# ENDPOINTS
# =========================
@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        resultado = gerar_conversa_ia(comando.texto, comando.contatos_validos)

        valor = resultado.get("valor")
        destinatario = resultado.get("destinatario")
        status = resultado.get("status")

        # =========================
        # 🔒 VALIDAÇÃO CRÍTICA BACKEND
        # =========================

        # 1. Valor precisa existir e ser número válido
        if valor is None:
            status = "MISSING_INFO"
            resultado["texto"] = "Não identifiquei o valor do Pix. Pode repetir com o valor?"

        elif not isinstance(valor, (int, float)):
            status = "BLOCKED"
            resultado["texto"] = "Valor inválido detectado."

        elif float(valor) <= 0:
            status = "BLOCKED"
            resultado["texto"] = "O valor precisa ser maior que zero."

        # 2. Destinatário precisa estar na whitelist
        elif destinatario not in comando.contatos_validos:
            status = "BLOCKED"
            resultado["texto"] = "Destinatário não autorizado ou não encontrado na sua lista de contatos."

        # 3. Tudo ok → pedir confirmação ao usuário antes de autenticar
        else:
            status = "CONFIRM"
            valor_formatado = f"R$ {float(valor):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            resultado["texto"] = (
                f"Confirmar Pix de {valor_formatado} para {destinatario}? "
                f"Os dados estão corretos?"
            )

        resultado["status"] = status

        # =========================
        # ÁUDIO
        # =========================
        arquivo_audio = None
        audio_url = None

        try:
            arquivo_audio = f"resposta_{uuid.uuid4().hex}.mp3"
            audio_stream = client_eleven.text_to_speech.convert(
                voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah — voz natural e fluida
                model_id="eleven_turbo_v2_5",       # Modelo mais rápido e natural
                text=resultado["texto"],
                voice_settings={
                    "stability": 0.4,          # Mais expressividade
                    "similarity_boost": 0.85,  # Alta fidelidade à voz original
                    "style": 0.3,              # Leve entonação emocional
                    "use_speaker_boost": True  # Clareza e presença na voz
                }
            )

            with open(arquivo_audio, "wb") as f:
                for chunk in audio_stream:
                    if chunk:
                        f.write(chunk)

            audio_url = f"/audio/{arquivo_audio}"

        except Exception as e_audio:
            print(f"Erro ElevenLabs: {e_audio}")
            audio_url = None

        return {
            "texto_falado": comando.texto,
            "resposta": resultado["texto"],
            "status": status,
            # valor e destinatario só expostos quando prontos para confirmar/autenticar
            "valor": float(valor) if status in ("CONFIRM", "REQUIRE_AUTH") and valor is not None else None,
            "destinatario": destinatario if status in ("CONFIRM", "REQUIRE_AUTH") else None,
            "audio_url": audio_url
        }

    except Exception as e:
        print(f"Erro Geral: {e}")
        return {"resposta": "Erro ao processar comando.", "status": "ERROR"}


@app.get("/audio/{nome_arquivo}")
def get_audio(nome_arquivo: str):
    return FileResponse(nome_arquivo, media_type="audio/mpeg")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)