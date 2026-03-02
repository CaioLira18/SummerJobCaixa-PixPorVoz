# 1. Estágio de Build do Java (Maven)
FROM maven:3.9.6-eclipse-temurin-21 AS build-java
WORKDIR /app
COPY caixa/. .
RUN mvn clean package -DskipTests

# 2. Estágio Final (Runtime)
FROM eclipse-temurin:21-jre

# Instala o Python e o pip dentro do ambiente Java
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    apt-get clean

WORKDIR /app

# Copia o JAR do Java
COPY --from=build-java /app/target/*.jar app.jar

# Copia os arquivos do Python (ajuste o caminho se estiver em outra pasta)
COPY . .

# Instala as dependências do Python
# Se o seu requirements.txt estiver na raiz:
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

# Expõe a porta
EXPOSE 8080

# COMANDO DE INICIALIZAÇÃO
# Se você quer rodar o PYTHON como processo principal:
CMD ["uvicorn", "ai-agent_config.main:app", "--host", "0.0.0.0", "--port", "8080"]

# Se você quer rodar o JAVA como processo principal:
# CMD ["java", "-jar", "app.jar"]