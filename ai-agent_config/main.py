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

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct" 

app = FastAPI(title="Pix Voice - Memória GPT")

client_hf = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adicionado campo 'historico' para receber o contexto do chat
class ComandoVoz(BaseModel):
    texto: str
    historico: list = [] 

def gerar_conversa_ia(texto_usuario, entidades, historico_anterior):
    # Prompt ajustado para priorizar o contexto das mensagens anteriores
    prompt_sistema = (
        "Você é o sistema de transações da Caixa com memória de curto prazo. "
        "Sua função é confirmar o valor e o destinatário do Pix. "
        "Use o histórico de mensagens para identificar dados que o usuário já informou antes. "
        "Apenas diga: 'Entendido. Você confirma um Pix de [VALOR] para [DESTINATÁRIO]?' "
        "Se faltar alguma informação (valor ou nome), peça educadamente."
    )

    # Montagem do histórico para o modelo Instruct
    messages = [{"role": "system", "content": prompt_sistema}]
    
    for msg in historico_anterior:
        role = "user" if msg['sender'] == 'user' else "assistant"
        messages.append({"role": role, "content": msg['text']})

    # Adiciona a entrada atual
    messages.append({"role": "user", "content": f"O usuário disse: {texto_usuario}"})

    try:
        response = client_hf.chat_completion(
            messages=messages,
            max_tokens=60, 
            temperature=0.2 # Menor temperatura para evitar alucinações no histórico
        )
        return response.choices[0].message.content
    except Exception as e:
        return agente_pix(texto_usuario, entidades)

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_original = comando.texto.strip()
        if len(texto_original) < 3:
            return {"resposta": "Não entendi, pode repetir?"}

        texto_limpo = normalizar_texto(texto_original)
        entidades = extrair_entidades(texto_limpo)
        
        # Passa o histórico recebido para a IA
        resposta_final = gerar_conversa_ia(texto_limpo, entidades, comando.historico)

        return {
            "texto_falado": texto_original,
            "resposta": resposta_final,
            "entidades": entidades
        }
    except Exception as e:
        return {"resposta": "Erro ao processar comando."}