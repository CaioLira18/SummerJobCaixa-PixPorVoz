def agente_pix(texto: str, entidades: list):
    """
    Agente determinístico para comandos Pix.
    Espera entidades no formato:
    {
        "texto": "...",
        "tipo": "Quantity" | "Person" | "DateTime",
        "confianca": float
    }
    """

    valor = None
    destinatario = None
    data = None

    # ======================
    # PRIORIZAÇÃO DE ENTIDADES
    # ======================

    for e in entidades:
        tipo = e.get("tipo")
        texto_ent = e.get("texto")
        confianca = e.get("confianca", 0)

        # Ignora ruído extremo
        if confianca < 0.5:
            continue

        if tipo == "Quantity" and not valor:
            valor = texto_ent

        elif tipo == "Person" and not destinatario:
            destinatario = texto_ent

        elif tipo in ("DateTime", "Date") and not data:
            data = texto_ent

    # ======================
    # INTENÇÃO PIX
    # ======================

    palavras_pix = [
        "pix",
        "transferir",
        "transferência",
        "enviar",
        "mandar",
        "pagar",
        "pagamento"
    ]

    is_pix = any(p in texto.lower() for p in palavras_pix)

    # ======================
    # RESPOSTA
    # ======================

    if is_pix and valor and destinatario:
        resposta = f"Você quer fazer um Pix de {valor} para {destinatario}"
        if data:
            resposta += f" na data {data}"
        resposta += ". Está correto?"
        return resposta

    if is_pix and not valor:
        return "Qual é o valor do Pix?"

    if is_pix and not destinatario:
        return "Para quem você deseja enviar o Pix?"

    return "Não consegui entender seu pedido. Você pode repetir?"