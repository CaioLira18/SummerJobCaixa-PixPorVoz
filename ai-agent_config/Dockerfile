# 1. Imagem base leve do Python
FROM python:3.11-slim

# 2. Diretório de trabalho no container
WORKDIR /app

# 3. Copia o requirements da raiz para instalar as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copia TODO o conteúdo da sua pasta ai-agent_config para a raiz /app do container
# Isso faz com que o main.py fique diretamente em /app/main.py
COPY ai-agent_config/ .

# 5. Define a porta (Railway usa a 8080 por padrão se não houver variável)
ENV PORT=8080
EXPOSE 8080

# 6. Comando de inicialização
# Agora que o conteúdo da pasta está na raiz do container, chamamos apenas 'main:app'
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]