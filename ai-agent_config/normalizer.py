import re
import unicodedata

def normalizar_texto(texto: str) -> str:
    if not texto:
        return ""

    texto = texto.lower().strip()

    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))

    substituicoes = {
        "pra ": "para ",
        "pro ": "para o ",
        "pixx": "pix",
        "pics": "pix",
        "pique": "pix",
        "reai": "reais",
        "reais reais": "reais",
        "mandar": "enviar",
        "transferencia": "transferir",
        "manda": "enviar",
        "pagar": "enviar",
        "dinheiro": "",
    }

    for errado, certo in substituicoes.items():
        texto = texto.replace(errado, certo)

    texto = re.sub(r"\b(eh|ah|hum|hmm|tipo|entao)\b", "", texto)

    texto = re.sub(r"\s+", " ", texto).strip()
    return texto
