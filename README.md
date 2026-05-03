# 🚀 AI Blog Generation Agent (LangGraph)

## 📌 Overview

This project implements a **planning-based AI blog generation system** using LangGraph.

Unlike traditional LLM applications that rely on direct prompting, this system follows an **agentic architecture**, where the AI:

- Plans content structure
- Performs research when required
- Generates content in parallel
- Enhances output with visuals

The result is a **modular, scalable, and production-style AI system**.

---

## 🧠 Key Features

### 1. Planning-Based Architecture
- Uses an **orchestrator–worker model**
- Planner generates structured outline
- Workers generate sections in parallel

### 2. Structured Output (Pydantic)
- Enforces schema for blog structure
- Ensures consistency in:
  - Sections
  - Word limits
  - Formatting

### 3. Research Integration
- Integrated with **Tavily Search API**
- Dynamically decides when external research is required
- Stores results as **evidence in state**

### 4. Automated Image Generation
- Identifies where images are needed
- Generates prompts
- Uses **Google Gemini** for image creation
- Embeds visuals into markdown output

### 5. State Management
- Uses LangGraph state system
- Maintains:
  - Plan
  - Evidence
  - Generated content

### 6. End-to-End Application
- Built with **Streamlit UI**
- Fully functional user interface
- Real-time blog generation

---

## 🏗️ Architecture

The system follows a modular pipeline:

User Input → Router → Planner → Workers → Reducer → Image Generation → Output

Key components:
- Router Node
- Planner Node
- Worker Nodes
- Research Node
- Image Node
- Reducer Logic

---

## ⚙️ Tech Stack

- Python
- LangGraph
- LangChain
- Pydantic
- Tavily API
- Google Gemini
- Streamlit

---

## 🚀 How It Works

1. User provides a blog topic
2. Router determines if research is required
3. Planner creates structured outline
4. Workers generate content sections in parallel
5. Research data is injected (if needed)
6. Images are generated and embedded
7. Final blog is rendered in UI

---

## 🧠 Key Learnings

- Planning-based systems outperform direct prompting
- Structured state improves reliability
- Tool integration enables real-world use cases
- Agentic workflows require careful orchestration

---

## 📈 Future Improvements

- Add long-term memory for personalization
- Multi-agent collaboration
- Advanced RAG integration
- SEO optimization module

---

## 📬 Contact

Feel free to connect for discussions on:
- Agentic AI
- LangGraph workflows
- System architecture

---

⭐ If you found this useful, consider giving it a star!# Content-Writer-AI-Agent
