from agent import agente_pix

texto = "Quero fazer um pix de 200 reais para Maria amanhã"

entidades = [
    {"texto": "200 reais", "tipo": "Quantity"},
    {"texto": "Maria", "tipo": "Person"},
    {"texto": "amanhã", "tipo": "DateTime"}
]

print(agente_pix(texto, entidades))
