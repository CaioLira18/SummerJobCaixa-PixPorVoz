def agente_pix(texto, entidades):
    resposta = "Não consegui entender seu pedido."

    valor = None
    destinatario = None
    data = None

    for e in entidades:
        if e["tipo"] == "Quantity":
            valor = e["texto"]
        elif e["tipo"] == "Person":
            destinatario = e["texto"]
        elif e["tipo"] == "DateTime":
            data = e["texto"]

    if valor and destinatario:
        resposta = (
            f"Você quer fazer um PIX de {valor} "
            f"para {destinatario}"
        )
        if data:
            resposta += f" na data {data}"
        resposta += ". Está correto?"

    return resposta
