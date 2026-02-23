import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

from agent import agente_pix
from normalizer import normalizar_texto

load_dotenv()

# Configurações do Groq
GROQ_API_KEY = os.getenv("GROQ_API")
MODEL_ID = "llama-3.3-70b-versatile" 

app = FastAPI(title="Pix Voice - Groq Full com Chave Alternativa")

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
    IA processa o comando e solicita chave Pix caso o contato não seja favorito.
    """
    lista_permitida = ", ".join(contatos_validos) if contatos_validos else "Nenhum contato cadastrado"

    prompt_sistema = (
        "Você é o assistente virtual da Caixa Econômica Federal para Pix por voz. "
        f"LISTA DE CONTATOS FAVORITOS: [{lista_permitida}]. "
        "\nREGRAS DE RESPOSTA:\n"
        "1. Se o usuário mencionar um NOME que ESTÁ na LISTA DE FAVORITOS e um VALOR, "
        "responda: 'Entendido. Você confirma um Pix de [VALOR] para [NOME]?'\n"
        
        "2. Se o usuário mencionar um NOME que NÃO ESTÁ na lista, responda: "
        "'O contato [NOME] não está nos seus favoritos. Por favor, me diga a chave Pix (CPF, telefone ou e-mail) para quem deseja enviar.'\n"
        
        "3. Se o usuário fornecer uma chave Pix (número de telefone, CPF ou e-mail) diretamente, "
        "prossiga perguntando o valor (se não tiver sido dito) ou pedindo a confirmação.\n"
        
        "4. Se o usuário disser apenas o valor, pergunte para quem deseja enviar.\n"
        "5. Mantenha as respostas curtas, profissionais e no idioma Português do Brasil."
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
        return "Desculpe, tive um problema técnico. Pode repetir o valor e o destinatário?"

@app.post("/ouvir")
def ouvir_comando(comando: ComandoVoz):
    try:
        texto_limpo = normalizar_texto(comando.texto)
        
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
        print(f"Erro: {e}")
        return {"resposta": "Erro ao processar o comando de voz."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)