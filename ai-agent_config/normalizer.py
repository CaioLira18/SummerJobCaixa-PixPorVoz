import re
import unicodedata

def remover_acentos(texto: str) -> str:
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    )

SUBSTITUICOES = {
    # Erros fonéticos do PIX
    r"\bbits?\b|\bpics?\b|\bpits?\b": "pix",

    # Conectores
    r"\bpra\b": "para",
    r"\bpro\b": "para o",

    # Moeda
    r"\bbrl\b|\breal\b|\breais\b": "reais",

    # Gírias de valor
    r"\bcontos?\b|\bpila\b": "reais",

    # Verbos
    r"\benviar dinheiro\b|\bpagar\b|\btransferencia\b": "transferir",
}

STOPWORDS = [
    "hoje",
    "agora",
    "por favor",
    "porfavor",
    "rapidinho"
]

def normalizar_texto(texto: str) -> str:
    texto = texto.lower()
    texto = remover_acentos(texto)

    for padrao, substituicao in SUBSTITUICOES.items():
        texto = re.sub(padrao, substituicao, texto)

    for stop in STOPWORDS:
        texto = re.sub(rf"\b{stop}\b", "", texto)

    texto = re.sub(r"\s+", " ", texto).strip()
    return texto
