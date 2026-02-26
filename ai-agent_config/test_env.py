import os
from dotenv import load_dotenv

load_dotenv()

print("KEY:", os.getenv("AZURE_AI_KEY")[:5], "...")
print("ENDPOINT:", os.getenv("AZURE_AI_ENDPOINT"))
print("REGION:", os.getenv("AZURE_REGION"))
