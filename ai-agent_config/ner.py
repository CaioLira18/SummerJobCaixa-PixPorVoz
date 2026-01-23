import os
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

load_dotenv()

client = TextAnalyticsClient(
    endpoint=os.getenv("AZURE_AI_ENDPOINT"),
    credential=AzureKeyCredential(os.getenv("AZURE_AI_KEY"))
)

def extrair_entidades(texto):
    # Evita enviar strings vazias ou nulas para a API
    if not texto or not texto.strip():
        return []

    try:
        response = client.recognize_entities([texto])
        entidades = []

        for doc in response:
            # Verifica se o documento retornou erro (ex: texto vazio ou inválido)
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