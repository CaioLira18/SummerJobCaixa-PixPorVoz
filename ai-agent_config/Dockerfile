# 1. Imagem base
FROM python:3.11-slim

# 2. Diretório de trabalho
WORKDIR /app

# 3. Copia as dependências (subindo um nível para pegar o requirements da raiz)
# No Docker, o contexto de build precisa permitir isso, ou você deve mover o requirements para dentro da pasta
COPY requirements.txt ./ 

# Se o comando acima falhar no build, mova o arquivo requirements.txt para dentro da pasta ai-agent_config
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copia o conteúdo da pasta atual (onde está o main.py) para o container
COPY . .

# 5. Variáveis de ambiente
ENV PORT=8080
EXPOSE 8080

# 6. Comando de inicialização
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]