from normalizer import normalizar_texto
from parser import extrair_pix

def processar_comando(texto: str):
    texto_normalizado = normalizar_texto(texto)
    resultado = extrair_pix(texto_normalizado)

    if not resultado:
        return {
            "success": False,
            "message": "Não consegui identificar o valor ou o destinatário. Pode repetir, por favor?"
        }

    return {
        "success": True,
        "valor": resultado["valor"],
        "destinatario": resultado["destinatario"],
        "message": f"Confirmando Pix de {resultado['valor']} reais para {resultado['destinatario']}. Posso continuar?"
    }
