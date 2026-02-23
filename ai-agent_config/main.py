import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Removido: from ner import extrair_entidades (Azure)
from agent import agente_pix
from normalizer import normalizar_texto

load_dotenv()

# Configurações do Groq (conforme sua imagem image_e18247.png)
GROQ_API_KEY = os.getenv("GROQ_API")
MODEL_ID = "llama-3.3-70b-versatile" 

app = FastAPI(title="Pix Voice - Groq Full")

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
    contatos_validos: list = []

def gerar_conversa_ia(texto_usuario, historico_anterior, contatos_validos):
    """
    Substitui o Azure NER: A própria IA extrai os dados e valida os contatos.
    """
    lista_permitida = ", ".join(contatos_validos) if contatos_validos else "Nenhum contato cadastrado"

    prompt_sistema = (
        "Você é o assistente virtual da Caixa Econômica Federal. "
        f"LISTA DE CONTATOS AUTORIZADOS: [{lista_permitida}]. "
        "Sua tarefa é extrair o VALOR e o DESTINATÁRIO da frase do usuário.\n"
        "REGRAS:\n"
        "1. Se o nome não estiver na LISTA DE CONTATOS, informe que o contato não existe.\n"
        "2. Se faltar o valor, peça o valor.\n"
        "3. Se tudo estiver correto, responda: 'Entendido. Você confirma um Pix de [VALOR] para [NOME]?'"
    )

    messages = [{"role": "system", "content": prompt_sistema}]
    
    for msg in historico_anterior:
        role = "user" if msg['sender'] == 'user' else "assistant"
        messages.append({"role": role, "content": msg['text']})

    messages.append({"role": "user", "content": texto_usuario})

    try:
        response = client_groq.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            temperature=0.1
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Erro Groq: {e}")
        return "Desculpe, tive um problema técnico. Pode repetir o valor e para quem deseja enviar?"

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_limpo = normalizar_texto(comando.texto) #
        
        # Chamada direta para o Groq (Ignorando o Azure quebrado)
        resposta_final = gerar_conversa_ia(
            texto_limpo, 
            comando.historico, 
            comando.contatos_validos
        )

        return {
            "texto_falado": comando.texto,
            "resposta": resposta_final
        }
    except Exception as e:
        return {"resposta": "Erro ao processar comando."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)