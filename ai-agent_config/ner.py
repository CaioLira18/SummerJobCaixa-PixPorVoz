import os
import re
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ======================
# CLIENTE IA (GROQ)
# ======================

def obter_cliente():
    key = os.getenv("GROQ_API_KEY")

    if not key:
        raise ValueError(
            "Configuração GROQ incompleta: GROQ_API_KEY não encontrada"
        )

    return Groq(api_key=key)


# ======================
# FALLBACKS MANUAIS
# ======================

def extrair_valor_regex(texto):
    """
    Extrai valores monetários simples via regex
    Ex: 50, R$50, 50 reais
    """
    padrao = r"(r\$?\s?\d+[,.]?\d*)|(\d+\s?reais?)"
    match = re.search(padrao, texto.lower())
    return match.group(0) if match else None


def extrair_destinatario_regex(texto):
    """
    Extrai possível destinatário após:
    para / pra / pro
    """
    padrao = r"(?:para|pra|pro)\s+([a-zà-ú]+)"
    match = re.search(padrao, texto.lower())
    return match.group(1).capitalize() if match else None


# ======================
# EXTRAÇÃO PRINCIPAL IA
# ======================

def extrair_entidades(texto: str):

    if not texto or not texto.strip():
        return []

    entidades = []

    try:
        client = obter_cliente()

        prompt = f"""
        Você é um sistema CRÍTICO de extração para PIX por voz.

        EXTRAIA:
        - valor monetário
        - destinatário

        REGRAS ABSOLUTAS:

        1. Nunca invente informações.
        2. Se houver dúvida no valor → retorne null.
        3. Se houver dúvida no destinatário → retorne null.
        4. Converta valores por extenso para número.
        5. O valor deve ser float.
        6. Retorne apenas quando tiver certeza.

        Retorne SOMENTE JSON:

        {{
            "valor": float ou null,
            "destinatario": string ou null,
            "confianca": número entre 0 e 1
        }}

        TEXTO:
        "{texto}"
        """

        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0
        )

        data = json.loads(response.choices[0].message.content)

        # ======================
        # VALIDAÇÃO FORTE
        # ======================

        valor = data.get("valor")
        destinatario = data.get("destinatario")
        confianca = data.get("confianca", 0.9)

        if valor is not None:
            entidades.append({
                "texto": str(valor),
                "tipo": "Quantity",
                "confianca": confianca
            })

        if destinatario:
            entidades.append({
                "texto": destinatario,
                "tipo": "Person",
                "confianca": confianca
            })

    except Exception as e:
        print("⚠️ Erro IA NER:", e)

    # ======================
    # FALLBACKS (MANTIDOS)
    # ======================

    tipos = {e["tipo"] for e in entidades}

    if "Quantity" not in tipos:
        valor = extrair_valor_regex(texto)
        if valor:
            entidades.append({
                "texto": valor,
                "tipo": "Quantity",
                "confianca": 0.6
            })

    if "Person" not in tipos:
        nome = extrair_destinatario_regex(texto)
        if nome:
            entidades.append({
                "texto": nome,
                "tipo": "Person",
                "confianca": 0.6
            })

    return entidades