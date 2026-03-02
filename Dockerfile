# 1. Estágio de Build do Java (Maven)
FROM maven:3.9.6-eclipse-temurin-21 AS build-java
WORKDIR /app
# Copia especificamente a pasta do java
COPY caixa/ . 
RUN mvn clean package -DskipTests

# 2. Estágio Final (Híbrido)
FROM eclipse-temurin:21-jre

# Instala Python e dependências de sistema
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    apt-get clean

WORKDIR /app

# Copia o JAR do estágio de build
COPY --from=build-java /app/target/*.jar app.jar

# COPIA A PASTA DO PYTHON (Crucial!)
# Copia a pasta ai-agent_config para dentro do container
COPY ai-agent_config/ ./ai-agent_config/
# Copia o requirements que está na raiz
COPY requirements.txt .

# Instala as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

# Expõe a porta padrão
EXPOSE 8080


# Comando para rodar o Python (ajustado para o caminho do módulo)
CMD ["uvicorn", "ai-agent_config.main:app", "--host", "0.0.0.0", "--port", "8080"]