def agente_pix_ia(dados_ia):
    # Extrai os campos do dicionário retornado pela IA
    valor = dados_ia.get("valor")
    destinatario = dados_ia.get("destinatario")
    data = dados_ia.get("data")

    if valor and destinatario:
        msg = f"Você quer fazer um PIX de {valor} para {destinatario}"
        if data:
            msg += f" na data {data}"
        resposta = msg + ". Está correto?"
    else:
        resposta = "Desculpe, não entendi o valor ou para quem enviar. Pode repetir?"

    return {
        "resposta": resposta,
        "valor": valor,
        "destinatario": destinatario,
        "data": data
    }