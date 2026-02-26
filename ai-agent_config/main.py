import os
import uuid
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from elevenlabs.client import ElevenLabs

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
    lista_formatada = ", ".join(contatos_validos) if contatos_validos else "NENHUM CONTATO CADASTRADO"

    # Alterado para forçar a extração do nome mesmo que fora da lista
    prompt_sistema = f"""
    Você é um extrator de dados para um sistema de PIX por voz.
    
    MISSÃO:
    1. Identifique o VALOR numérico.
    2. Identifique o DESTINATÁRIO (o nome que o usuário falar).

    LISTA DE FAVORITOS: [{lista_formatada}]

    REGRAS DE STATUS:
    - Se o nome identificado ESTIVER na lista de favoritos, status = "CONFIRM".
    - Se o nome identificado NÃO ESTIVER na lista, status = "BLOCKED".
    - Se não encontrar um valor, status = "MISSING_INFO".

    IMPORTANTE: Sempre retorne o nome encontrado no campo "destinatario", mesmo que ele não esteja na lista.

    RETORNE APENAS JSON:
    {{
      "valor": float ou null,
      "destinatario": "string" ou null,
      "status": "string",
      "texto": "Uma frase curta de resposta"
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
        return {"texto": "Erro técnico.", "status": "ERROR", "valor": None, "destinatario": None}

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

        # 1. Validação de Valor
        if valor is None:
            status = "MISSING_INFO"
            resultado["texto"] = "Não identifiquei o valor. Pode repetir?"
        
        # 2. Validação de Destinatário (Cerca de Segurança)
        elif not destinatario:
            status = "BLOCKED"
            resultado["texto"] = "Não entendi para quem você deseja enviar o Pix."
            
        elif destinatario not in comando.contatos_validos:
            status = "BLOCKED"
            # Agora 'destinatario' contém "Pedro", permitindo personalizar a frase
            resultado["texto"] = f"O contato '{destinatario}' não foi encontrado na sua lista de favoritos."

        # 3. Sucesso
        elif status == "CONFIRM":
            valor_formatado = f"R$ {float(valor):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            resultado["texto"] = f"Confirmar Pix de {valor_formatado} para {destinatario}?"

        resultado["status"] = status

        # ÁUDIO
        arquivo_audio = f"resposta_{uuid.uuid4().hex}.mp3"
        try:
            audio_stream = client_eleven.text_to_speech.convert(
                voice_id="EXAVITQu4vr4xnSDxMaL",
                model_id="eleven_turbo_v2_5",
                text=resultado["texto"],
                voice_settings={"stability": 0.4, "similarity_boost": 0.85}
            )
            with open(arquivo_audio, "wb") as f:
                for chunk in audio_stream:
                    if chunk: f.write(chunk)
            audio_url = f"/audio/{arquivo_audio}"
        except:
            audio_url = None

        return {
            "texto_falado": comando.texto,
            "resposta": resultado["texto"],
            "status": status,
            "valor": float(valor) if status == "CONFIRM" else None,
            "destinatario": destinatario if status == "CONFIRM" else None,
            "audio_url": audio_url
        }
    except Exception as e:
        return {"resposta": "Erro ao processar.", "status": "ERROR"}

@app.get("/audio/{nome_arquivo}")
def get_audio(nome_arquivo: str):
    return FileResponse(nome_arquivo, media_type="audio/mpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)