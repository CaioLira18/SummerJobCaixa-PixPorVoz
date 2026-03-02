# 1. Usamos uma imagem leve focada em Python
FROM python:3.11-slim

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia o arquivo de dependências que está na sua raiz
COPY requirements.txt .

# 4. Instala as bibliotecas do Python
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia a pasta do código Python para dentro do container
# Isso garante que a pasta 'ai-agent_config' exista no destino
COPY ai-agent_config/ ./ai-agent_config/

# 6. Expõe a porta que o Railway utiliza
EXPOSE 8080

# 7. Comando de inicialização corrigido
# Usamos o caminho do módulo 'ai-agent_config.main' para o Uvicorn encontrar o app
CMD ["uvicorn", "ai-agent_config.main:app", "--host", "0.0.0.0", "--port", "8080"]