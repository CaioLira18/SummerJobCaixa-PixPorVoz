import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq  # Importação alterada

# Importações dos seus módulos locais
from ner import extrair_entidades
from agent import agente_pix
from normalizer import normalizar_texto

load_dotenv()

# Configurações do Ambiente
GROQ_API_KEY = os.getenv("GROQ_API")
MODEL_ID = "llama-3.3-70b-versatile" # Modelo sugerido para alta performance no Groq

app = FastAPI(title="Pix Voice - Sistema Groq")

# Inicializa o cliente Groq
client_groq = Groq(api_key=GROQ_API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComandoVoz(BaseModel):
    texto: str
    historico: list = [] 

def salvar_historico_para_treino(texto_usuario, resposta_ia, historico_anterior):
    diretorio = "json"
    if not os.path.exists(diretorio): os.makedirs(diretorio)
    
    arquivo_treino = os.path.join(diretorio, "treino_pix.jsonl")
    
    entrada = {
        "messages": [
            {"role": "system", "content": "Você é o assistente Pix da Caixa."}
        ]
    }
    
    for msg in historico_anterior:
        role = "user" if msg['sender'] == 'user' else "assistant"
        entrada["messages"].append({"role": role, "content": msg['text']})
    
    entrada["messages"].append({"role": "user", "content": texto_usuario})
    entrada["messages"].append({"role": "assistant", "content": resposta_ia})
    
    with open(arquivo_treino, "a", encoding="utf-8") as f:
        f.write(json.dumps(entrada, ensure_ascii=False) + "\n")

def gerar_conversa_ia(texto_usuario, entidades, historico_anterior):
    """Envia o prompt + histórico para o Groq gerar a resposta"""
    prompt_sistema = (
        "Você é o assistente virtual da Caixa Econômica Federal. "
        "Sua função é realizar transações Pix por voz. "
        "Analise o histórico para saber se o valor ou o destinatário já foram informados. "
        "Se todas as informações (VALOR e DESTINATÁRIO) estiverem presentes no histórico ou na frase atual, "
        "responda APENAS: 'Entendido. Você confirma um Pix de [VALOR] para [DESTINATÁRIO]?' "
        "Caso falte algo, peça a informação que falta de forma curta."
    )

    messages = [{"role": "system", "content": prompt_sistema}]
    
    for msg in historico_anterior:
        role = "user" if msg['sender'] == 'user' else "assistant"
        messages.append({"role": role, "content": msg['text']})

    messages.append({"role": "user", "content": texto_usuario})

    try:
        # Chamada específica do Groq
        response = client_groq.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            max_tokens=100,
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Erro Groq: {e}")
        # Fallback para o agente local (agente_pix) caso a API falhe
        return agente_pix(texto_usuario, entidades)

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_original = comando.texto.strip()
        if len(texto_original) < 2:
            return {"resposta": "Desculpe, não consegui ouvir direito."}

        texto_limpo = normalizar_texto(texto_original)
        entidades = extrair_entidades(texto_limpo)
        
        resposta_final = gerar_conversa_ia(texto_limpo, entidades, comando.historico)
        salvar_historico_para_treino(texto_original, resposta_final, comando.historico)

        return {
            "texto_falado": texto_original,
            "resposta": resposta_final,
            "entidades": entidades
        }
    except Exception as e:
        print(f"Erro Geral: {e}")
        return {"resposta": "Ocorreu um erro interno ao processar seu Pix."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)