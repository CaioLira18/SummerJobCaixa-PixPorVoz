import os
import re
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

load_dotenv()

# ======================
# CLIENTE AZURE (NER)
# ======================

def obter_cliente():
    key = os.getenv("AZURE_TEXT_KEY")
    endpoint = os.getenv("AZURE_TEXT_ENDPOINT")

    if not key or not endpoint:
        raise ValueError(
            f"Configuração Azure incompleta: "
            f"KEY={'OK' if key else 'ERRO'} | "
            f"ENDPOINT={'OK' if endpoint else 'ERRO'}"
        )

    return TextAnalyticsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(key)
    )

# ======================
# FALLBACKS MANUAIS
# ======================

def extrair_valor_regex(texto):
    padrao = r"(r\$?\s?\d+[,.]?\d*)|(\d+\s?reais?)"
    match = re.search(padrao, texto)
    return match.group(0) if match else None


def extrair_destinatario_regex(texto):
    padrao = r"(?:para|pra|pro)\s+([a-zà-ú]+)"
    match = re.search(padrao, texto)
    return match.group(1) if match else None


# ======================
# EXTRAÇÃO PRINCIPAL
# ======================

def extrair_entidades(texto: str):
    if not texto or not texto.strip():
        return []

    entidades = []

    try:
        client = obter_cliente()
        response = client.recognize_entities([texto])

        for doc in response:
            if doc.is_error:
                continue

            for ent in doc.entities:
                entidades.append({
                    "texto": ent.text,
                    "tipo": ent.category,
                    "confianca": ent.confidence_score
                })

    except Exception as e:
        print("⚠️ Erro Azure NER:", e)

    # ======================
    # FALLBACKS
    # ======================

    tipos = {e["tipo"] for e in entidades}

    if "Quantity" not in tipos:
        valor = extrair_valor_regex(texto)
        if valor:
            entidades.append({
                "texto": valor,
                "tipo": "Quantity",
                "confianca": 0.75
            })

    if "Person" not in tipos:
        nome = extrair_destinatario_regex(texto)
        if nome:
            entidades.append({
                "texto": nome.capitalize(),
                "tipo": "Person",
                "confianca": 0.7
            })

    return entidades