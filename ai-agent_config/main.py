from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from ner import extrair_entidades
from agent import agente_pix
from normalizer import normalizar_texto

# ======================
# BOOTSTRAP
# ======================

load_dotenv()

# Validação mínima do ambiente (NER)
TEXT_KEY = os.getenv("AZURE_TEXT_KEY")
TEXT_ENDPOINT = os.getenv("AZURE_TEXT_ENDPOINT")

if not TEXT_KEY or not TEXT_ENDPOINT:
    raise RuntimeError(
        "Configuração Azure Text Analytics incompleta no .env"
    )

app = FastAPI(title="Pix por Voz - Backend")

# ======================
# CORS (MVP)
# ======================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# MODELO DE ENTRADA
# ======================

class ComandoVoz(BaseModel):
    texto: str

# ======================
# ROTA PRINCIPAL
# ======================

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_original = comando.texto.strip()

        if len(texto_original) < 3:
            return {
                "texto_falado": "",
                "resposta": "Não consegui entender o comando. Pode repetir?"
            }

        # Normalização
        texto_limpo = normalizar_texto(texto_original)

        # Extração de entidades (NER)
        entidades = extrair_entidades(texto_limpo)

        # Agente Pix
        resposta_agente = agente_pix(texto_limpo, entidades)

        return {
            "texto_falado": texto_original,
            "texto_normalizado": texto_limpo,
            "entidades": entidades,   # útil para debug no MVP
            "resposta": resposta_agente
        }

    except Exception as e:
        print("❌ Erro no servidor:", e)
        return {
            "texto_falado": "",
            "resposta": "Ocorreu um erro ao processar seu pedido."
        }

# ======================
# HEALTH CHECK
# ======================

@app.get("/health")
def health():
    return {"status": "ok"}

# ======================
# EXECUÇÃO LOCAL
# ======================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Servidor rodando em http://127.0.0.1:8000")
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
