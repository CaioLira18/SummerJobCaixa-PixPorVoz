🤖 Agente de Voz PIX com Azure AI Services

Este projeto implementa um agente de IA por voz capaz de:

🎙️ Reconhecer fala (Speech to Text)

🧠 Corrigir erros comuns de reconhecimento (Phrase Hints + Normalização)

🎯 Detectar a intenção do usuário

🏷️ Extrair entidades como valor, pessoa e data (NER)

🔊 Responder por voz (Text to Speech, opcional)

O foco do projeto é robustez, tolerância a variações de fala e arquitetura limpa.

🧭 Arquitetura do Pipeline
Voz do usuário
 ↓
Speech to Text (Azure Speech)
 ↓
Phrase Hints (vocabulário guiado)
 ↓
Normalização de texto
 ↓
Detecção de Intenção
 ↓
NER (extração de entidades)
 ↓
Agente de decisão
 ↓
Resposta (texto / voz)

📁 Estrutura do Projeto
ai-agent/
│
├── stt.py            # STT + Phrase Hints + Normalização
├── normalizer.py     # Normalização de texto
├── intent.py         # Detecção de intenção
├── ner.py            # Named Entity Recognition
├── agent.py          # Lógica do agente PIX
├── main.py           # Orquestrador do fluxo
│
├── test_*.py         # Testes unitários por camada
├── .env              # Variáveis de ambiente (NÃO versionar)
└── README.md

⚙️ Pré-requisitos

Python 3.10+

Conta Azure com:

Azure AI Services (Cognitive Services)

Speech + Language habilitados

Microfone funcional

📦 Instalação das Dependências

Recomenda-se o uso de ambiente virtual.

python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows


Instale as dependências principais:

```bash
pip install requirements.txt
```

🔐 Configuração do .env

Crie um arquivo chamado .env na raiz do projeto.

📌 Onde obter os valores

No Azure Portal → recurso Azure AI Services → Keys and Endpoint

📄 Exemplo de .env
AZURE_SPEECH_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_AI_ENDPOINT=https://eastus.api.cognitive.microsoft.com/
AZURE_REGION=eastus


⚠️ Importante

Não versionar o .env

Adicionar ao .gitignore

Usar brazilsouth (minúsculo, sem espaço)


▶️ Executando a Aplicação

Para rodar o fluxo completo:

```bash
 uvicorn main:app --reload
```
