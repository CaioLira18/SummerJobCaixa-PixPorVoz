import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Importações dos seus módulos locais
from ner import extrair_entidades
from agent import agente_pix
from normalizer import normalizar_texto

load_dotenv()

# Configurações do Ambiente
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
# Modelo recomendado para conversação rápida e estável
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct" 

app = FastAPI(title="Pix Voice - HF Integrado")

# Inicializa o cliente com o token ajustado
client_hf = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComandoVoz(BaseModel):
    texto: str

def gerar_conversa_ia(texto_usuario, entidades):
    # O segredo está em dizer quem ela é e o que ela NÃO pode fazer
    prompt_sistema = (
        "Você é o sistema de transações da Caixa. Sua ÚNICA função é confirmar "
        "o valor e o destinatário identificados. "
        "NÃO dê instruções de como fazer o Pix. "
        "NÃO explique o passo a passo. "
        "Apenas diga: 'Entendido. Você confirma um Pix de [VALOR] para [DESTINATÁRIO]?'"
        f"Dados atuais: {entidades}"
    )

    messages = [
        {"role": "system", "content": prompt_sistema},
        {"role": "user", "content": f"O usuário disse: {texto_usuario}"},
    ]

    try:
        response = client_hf.chat_completion(
            messages=messages,
            max_tokens=50, # Reduzimos o tamanho da resposta para forçar brevidade
            temperature=0.3 # Temperatura baixa para a IA ser menos 'criativa'
        )
        return response.choices[0].message.content
    except Exception as e:
        # Se a IA falhar, o agente_pix (agente.py) já faz essa confirmação curta
        return agente_pix(texto_usuario, entidades)

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_original = comando.texto.strip()
        if len(texto_original) < 3:
            return {"resposta": "Não entendi, pode repetir?"}

        # Fluxo de processamento
        texto_limpo = normalizar_texto(texto_original)
        entidades = extrair_entidades(texto_limpo)
        
        # Obtém resposta (IA ou Agente local)
        resposta_final = gerar_conversa_ia(texto_limpo, entidades)

        return {
            "texto_falado": texto_original,
            "resposta": resposta_final,
            "entidades": entidades
        }
    except Exception as e:
        return {"resposta": "Erro ao processar comando."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)