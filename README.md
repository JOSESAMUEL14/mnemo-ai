# 🧠 Mnemo AI — The AI That Never Forgets You

[![Python](https://img.shields.io/badge/Python-3.12.1-blue?style=flat-square&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.3-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![Cognee](https://img.shields.io/badge/Cognee-V1.2.2-purple?style=flat-square)](https://cognee.ai)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Hackathon](https://img.shields.io/badge/WeMakeDevs%20x%20Cognee-Hackathon%202026-orange?style=flat-square)](https://wemakedevs.org)
[![Deployed](https://img.shields.io/badge/Deployed-Render.com-blue?style=flat-square)](https://mnemo-ai.onrender.com)

> *"The AI That Never Forgets You"*

**Mnemo AI** is a complete Life Intelligence Platform that builds a permanent knowledge graph of your entire life journey — every struggle, every win, every dream — and fights for you **every single day**.

## 🎯 **Live Demo**

Try Mnemo AI now: **[https://mnemo-ai.onrender.com](https://mnemo-ai.onrender.com)**

---

## 🎯 **Hackathon Track**

**Track 1: Best Use of Cognee Open Source**

- ✅ Uses **Cognee V1 Open Source** (self-hosted)
- ✅ Implements all **4 core Cognee APIs**: `remember`, `recall`, `improve`, `forget`
- ✅ Built with **₹0 budget** — completely free
- ✅ **Solo developer** — 7 days of focused building

---

## 🌟 The Problem

Every night, millions of people go to sleep feeling lost and forgotten.

Today's AI tools are **stateless** — they forget you the moment you close the tab. Your struggles disappear. Your goals vanish. Your growth is invisible. You start over from zero every single time.

There is no AI that truly *knows* you — your patterns, your fears, your progress, your story.

**This is the "Hangover Problem" — and Mnemo AI solves it.**

---

## 💡 The Solution

Mnemo AI uses **Cognee V1's revolutionary memory layer** to build a living knowledge graph of your life. It remembers everything you share — and gets smarter about you every single day.

- 🌙 **Tell Mnemo about your day** → get deeply personal motivation
- ☀️ **Wake up to DayStart Fuel** → based on your actual journey
- 🧠 **Ask anything about your life** → Mnemo knows your whole story
- 📈 **Watch your growth** → through your personal memory graph
- 🎯 **Lock in your goals** → Mnemo never lets you forget your dreams

---

## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Chat with Mnemo
![Chat](screenshots/chat.png)

### Daily Journal
![Journal](screenshots/journal.png)

### Life Insights
![Insights](screenshots/insights.png)

> *Screenshots coming soon - See demo video for full walkthrough*

---

## ✨ Features

### 🧠 Core Memory (Cognee V1)

| Feature | Description | Cognee API Used |
|---|---|---|
| DayEnd Ritual | Tell Mnemo about your day, get personal motivation | `remember` / `recall` |
| DayStart Fuel | Wake up to motivation based on yesterday's memories | `recall` |
| Life Ask | Ask anything about your life journey in natural language | `recall` + Graph Traversal |
| Pattern Detection | AI detects your life patterns automatically | `recall` + `improve` |
| Goal Guardian | Lock in goals — Mnemo never lets you forget them | `remember` / `recall` |
| Memory Graph | Live knowledge graph visualization of your life | Graph API |
| Session Tracking | Daily conversation tracking with persistent memory | Session API |

### 💌 Emotional Features

| Feature | Description |
|---|---|
| Time Capsule | Write letters to your future self, unlock after 30 days |
| Life Chapters | Auto-generates chapters of your life story |
| Memory Conflict Resolver | Detects contradictions in your memories |
| Mnemo Wrapped | Spotify-style weekly life summary |
| Future Self Letter | AI writes a letter from your future self |
| Memory Battles | Compare past you vs present you |
| Mnemo Mirror | AI reveals who you truly are from your memories |

### 🤖 AI Agent Features

| Feature | Description |
|---|---|
| Mnemo Coach Mode | Proactive daily life coaching based on your patterns |
| Mnemo Predict | Predicts your future based on past patterns |
| Real-time Emotion Detection | Detects emotions as you type your journal |
| Life Chapters Auto-generation | Groups memories into chapters automatically |
| Proactive Pattern Alerts | Mnemo notices patterns without being asked |

### 🔥 Technical Features

| Feature | Description |
|---|---|
| Live Memory Graph | D3.js knowledge graph updating in real time |
| Voice Input + Output | Web Speech API — speak to Mnemo, Mnemo speaks back |
| PWA Installable | Install as a mobile app, works offline |
| Real-time Mood Chart | Chart.js animated mood tracking |
| Public API | Developer endpoints for building on top of Mnemo |

### 🆓 Premium Free Features

| Feature | Description |
|---|---|
| Mnemo Score | Single number measuring your life growth |
| PDF Export | Download your life story as a beautiful PDF |
| Mnemo Share Card | Shareable growth card like Spotify Wrapped |
| Daily Notifications | Evening reminders for your DayEnd ritual |
| Dark / Light Mode | Smooth animated theme switching |
| Keyboard Shortcuts | Ctrl+J, Ctrl+C, Ctrl+I and more |
| Auto-save Journal | Never lose your writing |
| Memory DNA | Visual personality fingerprint from your memories |
| API Documentation | Full developer docs at `/api-docs` |

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Backend | Python Flask | Free |
| Memory | Cognee V1 Open Source + Cloud | Free |
| LLM | Groq Llama 3.3 70B | Free |
| Embeddings | Fastembed BAAI/bge-small-en-v1.5 | Free |
| Frontend | Vanilla HTML + CSS + JS | Free |
| Icons | Tabler Icons CDN | Free |
| Graph Viz | D3.js | Free |
| Charts | Chart.js | Free |
| PDF Export | jsPDF | Free |
| Voice | Web Speech API built into browser | Free |
| PWA | Service Worker + Web Manifest | Free |
| **Total Cost** | | **₹0** |

---

## 🧠 How Cognee Powers Mnemo AI

Mnemo AI uses **all 4 core Cognee V1 APIs** meaningfully:

### 1. `cognee.remember()` — Save Life Memories

```python
# Daily journal entry
await cognee.remember(
    "JOURNAL 2026-07-01 MOOD:determined - Today I built something real.",
    dataset_name="main_dataset",
    session_id=SESSION_ID
)

# Lock in a goal
await cognee.remember(
    "GOAL: Win this hackathon and prove myself",
    dataset_name="main_dataset",
    session_id=SESSION_ID
)

# Time Capsule
await cognee.remember(
    "TIME CAPSULE 2026-08-01: Dear future me, today I started with nothing but determination...",
    dataset_name="main_dataset",
    session_id=SESSION_ID
)
```

### 2. `cognee.recall()` — Query Life Memories

```python
# Get personal motivation
results = await cognee.recall(
    "Based on my journey, give me powerful motivation for tomorrow.",
    session_id=SESSION_ID
)

# Life Ask
results = await cognee.recall(
    "When was the last time I felt truly proud?",
    session_id=SESSION_ID
)

# Pattern detection
results = await cognee.recall(
    "Analyze my memories and describe my resilience and growth as percentages.",
    session_id=SESSION_ID
)
```

### 3. `cognee.improve()` — Bridge Session to Permanent Memory

```python
# Run at end of each day to make session memories permanent
await cognee.improve(
    dataset="main_dataset",
    session_ids=[SESSION_ID],
    build_global_context_index=True
)
```

### 4. `cognee.forget()` — Forget and Heal

```python
# Release a specific dataset
await cognee.forget(dataset="main_dataset")

# Complete fresh start
await cognee.forget(everything=True)
```

---

## 🚀 Installation and Setup

### Prerequisites

- Python 3.12+
- Git
- A free [Groq API key](https://console.groq.com)
- A free [Cognee account](https://platform.cognee.ai)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/JOSESAMUEL14/mnemo-ai-final.git
cd mnemo-ai-final

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your .env file
copy .env.example .env

# 4. Add your API keys to .env
# Open .env in any text editor and fill in your keys

# 5. Create required folders
mkdir cognee_system
mkdir cognee_system\databases
mkdir data_storage

# 6. Run the app
python app.py

# 7. Open in browser
# http://localhost:5000
```

### Environment Variables

```env
LLM_API_KEY=your_groq_api_key_here
CACHING=false
ENABLE_BACKEND_ACCESS_CONTROL=false
```

---

## 📁 Project Structure

```
mnemo-ai/
├── app.py                    # Flask backend + all API routes
├── .env                      # API keys — never commit this
├── .gitignore
├── requirements.txt
├── README.md
├── .python-version           # Python version for Render
├── templates/
│   ├── landing.html          # Landing page + Solar Memory logo
│   ├── dashboard.html        # Main dashboard
│   ├── chat.html             # Chat with Mnemo — ChatGPT style
│   ├── journal.html          # DayEnd ritual + emotion detection
│   ├── insights.html         # Memory graph + patterns + mirror
│   ├── goals.html            # Goal Guardian
│   ├── timeline.html         # Life journey visualization
│   ├── future.html           # Time Capsule + Future Self letter
│   ├── forget.html           # Forget and Heal
│   ├── wrapped.html          # Mnemo Wrapped weekly summary
│   └── api_docs.html         # Developer API documentation
└── static/
    ├── manifest.json         # PWA manifest
    └── js/
        ├── voice.js          # Web Speech API module
        ├── export.js         # PDF export with jsPDF
        ├── notifications.js  # Browser notification reminders
        ├── sw.js             # Service Worker for PWA
        ├── shortcuts.js      # Keyboard shortcuts
        └── theme.js          # Dark and light mode toggle
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Cognee API Used |
|---|---|---|---|
| POST | `/api/remember` | Save a memory to Cognee | `remember` |
| POST | `/api/recall` | Query memories with natural language | `recall` |
| POST | `/api/forget` | Delete memories | `forget` |
| GET | `/api/stats` | Get memory statistics | `recall` |
| GET | `/api/insights` | Get life patterns and Mnemo Score | `recall` + `improve` |
| POST | `/api/mirror` | Get Mnemo Mirror personality reveal | `recall` |
| POST | `/api/battle` | Memory Battles past vs present | `recall` |
| GET | `/api/coach` | Get today's coaching mission | `recall` |
| POST | `/api/emotion` | Real-time emotion detection | `recall` |
| POST | `/api/check-conflict` | Check for memory conflicts | `recall` |

Full interactive documentation available at `/api-docs`

---

## 🎯 **Why This Project Stands Out**

1. **Solves the "Hangover Problem"** — AI that truly never forgets
2. **Uses ALL 4 Cognee APIs** — not just one or two
3. **Complete, polished application** — not a prototype
4. **45+ premium features** — all completely free
5. **₹0 budget** — built with free tools
6. **Solo developer** — 7 days of focused building
7. **PWA + Voice + Notifications** — modern web experience
8. **Live Demo** — Fully deployed and accessible

---

## 🌐 **Deployment**

This app is deployed on **Render.com** and is live at:

**[https://mnemo-ai.onrender.com](https://mnemo-ai.onrender.com)**

### Deployment Commands:

```bash
# Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# Render will auto-deploy
```

---

## 🤖 AI Assistance Disclosure

**This project was built with AI assistance as required to be disclosed under WeMakeDevs x Cognee Hackathon rules.**

- **Claude (Anthropic)** — Architecture planning, code review, bug diagnosis, API integration guidance, project strategy
- **Gemini (Google)** — HTML page generation, CSS styling, JavaScript module creation
- **DeepSeek** — Additional code generation and testing support

All AI-generated code was reviewed, tested, debugged, and integrated by the developer. The project concept, feature design, and overall vision are **original**.

---

## 🏆 Hackathon

**WeMakeDevs x Cognee Hackathon — "The Hangover Part AI"**

- 📅 **Dates:** June 29 – July 5, 2026
- 🎯 **Track:** Best Use of Cognee Open Source
- 👤 **Participant:** Solo developer
- 💰 **Budget:** ₹0
- 🏆 **Prize Goal:** MacBook Neo

---

## 📖 Blog Post

Read the full story of building Mnemo AI:
[Link to blog post — coming soon]

---

## 🎥 Demo Video

Watch Mnemo AI in action:
[Link to demo video — coming soon]

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **Cognee Team** — for building the most powerful open source memory layer
- **WeMakeDevs** — for organizing this incredible hackathon
- **Groq** — for providing free blazing-fast LLM inference
- **Tabler Icons** — for the beautiful icon set

---

*Built with ❤️ and determination. Solo. 7 days. ₹0.*

> *"The AI That Never Forgets You"*
