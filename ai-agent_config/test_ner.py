import os
from dotenv import load_dotenv
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

load_dotenv()

client = TextAnalyticsClient(
    endpoint=os.getenv("AZURE_AI_ENDPOINT"),
    credential=AzureKeyCredential(os.getenv("AZURE_AI_KEY"))
)

texto = "Quero fazer um pix de 250 reais para o João amanhã"

response = client.recognize_entities([texto])

for doc in response:
    for ent in doc.entities:
        print(ent.text, "|", ent.category, "|", ent.confidence_score)
