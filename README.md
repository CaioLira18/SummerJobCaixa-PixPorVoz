# 🎙️ PIX por Voz com IA Conversacional

Este projeto implementa um agente de inteligência artificial por voz integrado ao ecossistema da **CAIXA**, permitindo a realização de transferências Pix de forma 100% vocal. O foco é oferecer **acessibilidade** para pessoas com deficiência visual, motora ou baixa alfabetização digital, além de trazer praticidade ao público geral.

## 🚀 Funcionalidades do MVP

* **Speech-to-Text (STT):** Reconhecimento de fala robusto com suporte a variações.


* **Extração de Entidades (NER):** Identificação automática de valor, destinatário e data a partir da voz.


* **Lógica Conversacional:** Orquestração de diálogos via **Gemini (Google AI Studio)**.


* **Confirmação Ativa:** O sistema repete os dados extraídos para validação do utilizador antes de concluir a transação.


* **Interface Visual:** Front-end React desenvolvido seguindo o Design System da CAIXA.



## 🛠️ Tecnologias Utilizadas

* **Front-end:** React.


* **Back-end:** Java (Spring Boot) e Python (FastAPI).


* **IA e Voz:** * **Azure AI Services:** Speech to Text e Text to Speech.


* **Google AI Studio (Gemini):** Lógica do agente conversacional.


* **Hugging Face:** Suporte ao reconhecimento de entidades.





## 📂 Estrutura do Projeto

* `/ai-agent`: Agente de IA em Python (STT, NER, Processamento).
* `/client-web`: Interface do utilizador em React.
* `/backend-java`: Estrutura de serviços bancários em Spring Boot.

---

## ⚙️ Como Executar o Projeto

### 1. Configuração do Ambiente

Crie um ficheiro `.env` na raiz do módulo de IA (`/ai-agent`) com as suas credenciais:

```env
AZURE_SPEECH_KEY=sua_chave_aqui
AZURE_REGION=brazilsouth
AZURE_AI_ENDPOINT=seu_endpoint_aqui
AZURE_TEXT_KEY=sua_chave_aqui
AZURE_OPENIA_KEY=sua_chave_aqui
HUGGINGFACE_TOKEN=seu_token_aqui

```

*(Certifique-se de que os nomes das variáveis coincidem com os configurados no sistema)*

### 2. Back-end de IA (Python)

```bash
# Navegue até a pasta
cd ai-agent

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor
uvicorn main:app --reload

```

### 3. Front-end (React)

```bash
# Navegue até a pasta do front
cd client-web

# Instale as dependências
npm install

# Inicie o modo de desenvolvimento
npm run dev

```

### 4. Back-end Principal (Java/Spring Boot)

Importe o projeto em sua IDE (VsCode/Eclipse) e execute a classe `CaixaApplication.java` como uma aplicação Spring Boot.

---

## 🛡️ Segurança e Autenticação

Devido à preocupação dos utilizadores com a segurança da voz, o projeto adota uma abordagem de **hiper-personalização**, permitindo que o utilizador escolha o método de autenticação final:

* Biometria Facial ou Digital. (Estudando Possibilidade)
* Senha numérica.


*(CESAR Summer Job 2026.1)*
