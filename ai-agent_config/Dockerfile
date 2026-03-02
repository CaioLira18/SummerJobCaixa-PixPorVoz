FROM python:3.11-slim

# diretório padrão do container
WORKDIR /app

# instala dependências primeiro (cache otimizado)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copia o restante do projeto
COPY . .

# inicia FastAPI
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"