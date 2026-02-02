def agente_pix_ia(dados_ia):
    valor = dados_ia.get("valor")
    destinatario = dados_ia.get("destinatario")
    data = dados_ia.get("data")

    # Verifica o que foi encontrado para dar uma resposta específica
    if valor and destinatario:
        msg = f"Você quer fazer um PIX de {valor} para {destinatario}"
        if data:
            msg += f" na data {data}"
        resposta = msg + ". Está correto?"
    elif valor:
        resposta = f"Entendi o valor de {valor}, mas para quem você quer enviar?"
    elif destinatario:
        resposta = f"Entendi que é para {destinatario}, mas qual o valor do PIX?"
    else:
        resposta = "Não consegui identificar o valor ou o destinatário. Pode repetir, por favor?"

    return {
        "resposta": resposta,
        "valor": valor,
        "destinatario": destinatario,
        "data": data
    }