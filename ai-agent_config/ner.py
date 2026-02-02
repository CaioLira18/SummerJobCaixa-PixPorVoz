import os
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

# Força o carregamento do .env
load_dotenv()

def obter_cliente():
    """Cria o cliente apenas quando necessário, garantindo que as chaves existam."""
    key = os.getenv("AZURE_SPEECH_KEY")
    endpoint = os.getenv("AZURE_LANGUAGE_ENDPOINT")
    
    if not key or not endpoint:
        # Erro detalhado para você saber o que está faltando
        raise ValueError(f"Faltando configuração no .env: KEY={'OK' if key else 'ERRO'}, ENDPOINT={'OK' if endpoint else 'ERRO'}")
    
    return TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

def extrair_entidades(texto):
    if not texto or not texto.strip():
        return []

    try:
        # Inicializa o cliente aqui dentro
        client = obter_cliente()
        response = client.recognize_entities([texto])
        entidades = []

        for doc in response:
            if not doc.is_error:
                for ent in doc.entities:
                    entidades.append({
                        "texto": ent.text,
                        "tipo": ent.category,
                        "confianca": ent.confidence_score
                    })
            else:
                print(f"Erro no processamento do documento: {doc.error.message}")

        return entidades
    except Exception as e:
        print(f"Erro ao conectar com o serviço NER: {e}")
        return []