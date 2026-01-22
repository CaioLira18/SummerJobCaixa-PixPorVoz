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
    response = client.recognize_entities([texto])
    entidades = []

    for doc in response:
        for ent in doc.entities:
            entidades.append({
                "texto": ent.text,
                "tipo": ent.category,
                "confianca": ent.confidence_score
            })

    return entidades
