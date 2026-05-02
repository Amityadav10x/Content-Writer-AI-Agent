import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

def test_model(model_name):
    print(f"Testing model: {model_name}")
    try:
        llm = ChatGoogleGenerativeAI(model=model_name)
        res = llm.invoke([HumanMessage(content="Hi")])
        print(f"Success! Response: {res.content}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

models_to_test = ["gemini-1.5-pro-latest", "gemini-pro-latest", "gemini-2.0-flash", "gemini-1.5-flash"]

for m in models_to_test:
    if test_model(m):
        break
