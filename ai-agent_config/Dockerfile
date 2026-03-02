FROM python:3.11-slim

WORKDIR /app

# Como o Dockerfile está dentro da pasta, 
# você precisa garantir que o requirements.txt esteja lá também.
# Se o requirements estiver na raiz do projeto (fora desta pasta), 
# mova ou copie uma cópia para dentro de 'ai-agent_config/'.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia tudo que está dentro de ai-agent_config para /app
COPY . .

# Garante que o Uvicorn use a porta do Railway e o host correto
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]