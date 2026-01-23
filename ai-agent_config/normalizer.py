import re
import unicodedata

def remover_acentos(texto: str) -> str:
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    )

SUBSTITUICOES = {
    # PIX (erros fonéticos comuns)
    r"\bbits?\b": "pix",
    r"\bpics?\b": "pix",
    r"\bpits?\b": "pix",

    # Ações
    r"\btransferencia\b": "transferência",
    r"\benviar dinheiro\b": "transferência",
    r"\bpagar\b": "transferência",

    # Moeda
    r"\br\$?\s?(\d+)": r"\1 reais",
    r"\breal\b": "reais",
}



def normalizar_texto(texto: str) -> str:
    texto = texto.lower()
    texto = remover_acentos(texto)

    for padrao, substituicao in SUBSTITUICOES.items():
        texto = re.sub(padrao, substituicao, texto)

    
    texto = re.sub(r"\s+", " ", texto).strip()

    return texto
