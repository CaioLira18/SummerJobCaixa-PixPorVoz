import re

def extrair_pix(texto: str):
    valor_match = re.search(r"(\d+(?:[.,]\d{1,2})?)", texto)
    destinatario_match = re.search(r"para\s+([a-zA-ZÀ-ÿ]+)", texto)

    if not valor_match or not destinatario_match:
        return None

    valor = float(valor_match.group(1).replace(",", "."))
    destinatario = destinatario_match.group(1).capitalize()

    return {
        "valor": valor,
        "destinatario": destinatario
    }
