# Usa uma imagem leve de Python
FROM python:3.11-slim

# Define o diretório de trabalho como /app
WORKDIR /app

# Copia o requirements que você moveu para dentro da pasta
COPY requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia TODOS os arquivos de 'ai-agent_config' para a raiz '/app' do container
# Isso garante que o main.py esteja em /app/main.py
COPY . .

# Comando de inicialização usando a variável de porta do Railway
# Agora o 'main:app' vai funcionar porque o arquivo está na raiz do container
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]