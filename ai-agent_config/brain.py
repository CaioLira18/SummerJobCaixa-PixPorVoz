import os
import json
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

def extrair_dados_com_ia(texto):
    client = AzureOpenAI(
        azure_endpoint=os.getenv("AZURE_OPEN_IA_ENDPOINT"),
        api_key=os.getenv("AZURE_OPEN_IA_KEY"),
        api_version="2024-02-01"
    )

    prompt = f"""
    Você é um assistente bancário. Extraia o valor, destinatário e data da frase.
    Responda APENAS um JSON:
    {{"valor": "string", "destinatario": "string", "data": "string"}}
    Frase: "{texto}"
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o", # Nome do seu deployment no Azure
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Erro IA: {e}")
        return {"valor": None, "destinatario": None, "data": None}