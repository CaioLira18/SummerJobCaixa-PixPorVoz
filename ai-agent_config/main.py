import os
import json
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
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct" 

app = FastAPI(title="Pix Voice - Sistema com Memória e Treino")

# Inicializa o cliente Hugging Face
client_hf = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de dados que recebe o texto e o histórico do React
class ComandoVoz(BaseModel):
    texto: str
    historico: list = [] 

def salvar_historico_para_treino(texto_usuario, resposta_ia, historico_anterior):
    """Salva a conversa no formato JSONL para futuro Fine-Tuning"""
    diretorio = "json"
    arquivo_treino = os.path.join(diretorio, "treino_pix.jsonl")
    
    entrada = {
        "messages": [
            {"role": "system", "content": "Você é o assistente Pix da Caixa."}
        ]
    }
    
    # Adiciona o contexto anterior
    for msg in historico_anterior:
        role = "user" if msg['sender'] == 'user' else "assistant"
        entrada["messages"].append({"role": role, "content": msg['text']})
    
    # Adiciona a interação atual
    entrada["messages"].append({"role": "user", "content": texto_usuario})
    entrada["messages"].append({"role": "assistant", "content": resposta_ia})
    
    with open(arquivo_treino, "a", encoding="utf-8") as f:
        f.write(json.dumps(entrada, ensure_ascii=False) + "\n")

def gerar_conversa_ia(texto_usuario, entidades, historico_anterior):
    """Envia o prompt + histórico para a IA gerar a resposta"""
    prompt_sistema = (
        "Você é o assistente virtual da Caixa Econômica Federal. "
        "Sua função é realizar transações Pix por voz. "
        "Analise o histórico para saber se o valor ou o destinatário já foram informados. "
        "Se todas as informações (VALOR e DESTINATÁRIO) estiverem presentes no histórico ou na frase atual, "
        "responda APENAS: 'Entendido. Você confirma um Pix de [VALOR] para [DESTINATÁRIO]?' "
        "Caso falte algo, peça a informação que falta de forma curta."
    )

    # Monta o payload de mensagens com histórico (Memória Estilo GPT)
    messages = [{"role": "system", "content": prompt_sistema}]
    
    for msg in historico_anterior:
        role = "user" if msg['sender'] == 'user' else "assistant"
        messages.append({"role": role, "content": msg['text']})

    # Adiciona a frase atual do usuário
    messages.append({"role": "user", "content": texto_usuario})

    try:
        response = client_hf.chat_completion(
            messages=messages,
            max_tokens=60,
            temperature=0.2 # Baixa para evitar que a IA invente coisas
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Erro HF: {e}")
        # Fallback para o agente local caso a API falhe
        return agente_pix(texto_usuario, entidades)

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_original = comando.texto.strip()
        if len(texto_original) < 2:
            return {"resposta": "Desculpe, não consegui ouvir direito."}

        # 1. Normaliza o texto (remove ruídos, padroniza palavras)
        texto_limpo = normalizar_texto(texto_original)
        
        # 2. Extrai entidades via Azure (opcional para logs/verificação)
        entidades = extrair_entidades(texto_limpo)
        
        # 3. Gera a resposta usando a IA com Memória
        resposta_final = gerar_conversa_ia(texto_limpo, entidades, comando.historico)

        # 4. Salva a interação para o seu banco de dados de treino JSON
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