
INTENCOES = {
    "PIX_TRANSFER": [
        "pix",
        "transferência",
        "transferir",
        "enviar dinheiro",
        "pagamento",
        "pagar"
    ]
}

def detectar_intencao(texto_normalizado: str) -> str | None:
    texto = texto_normalizado.lower()

    for intencao, gatilhos in INTENCOES.items():
        for gatilho in gatilhos:
            if gatilho in texto:
                return intencao

    return None
