from flask import Flask, render_template, request, jsonify
import cognee
import asyncio
import sys
from datetime import datetime
import re

app = Flask(__name__)

SESSION_ID = datetime.now().strftime("day_%Y_%m_%d")

# Fix Windows async selector framework loop crashes
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

def run_async(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        return loop.run_until_complete(coro)
    else:
        return asyncio.run(coro)

# ===== PAGE ROUTES =====

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/journal')
def journal():
    return render_template('journal.html')

@app.route('/insights')
def insights():
    return render_template('insights.html')

@app.route('/goals')
def goals():
    return render_template('goals.html')

@app.route('/timeline')
def timeline():
    return render_template('timeline.html')

@app.route('/future')
def future():
    return render_template('future.html')

@app.route('/forget')
def forget_page():
    return render_template('forget.html')

@app.route('/api-docs')
def api_docs():
    return render_template('api_docs.html')

# ===== API ROUTES =====

@app.route('/api/remember', methods=['POST'])
def remember():
    data = request.json or {}
    text = data.get('text', '') or data.get('memory', '')
    dataset = data.get('dataset', 'main_dataset')

    if not text.strip():
        return jsonify({"status": "error", "message": "Memory content cannot be empty"}), 400

    async def save():
        await cognee.remember(
            text,
            dataset_name=dataset,
            session_id=SESSION_ID
        )

    run_async(save())
    return jsonify({"status": "success", "message": "Memory saved!"})


@app.route('/api/recall', methods=['POST'])
def recall():
    data = request.json or {}
    query = data.get('query', '')
    language = data.get('language', 'English')
    full_query = f"{query} Please respond in {language}."

    async def get_memory():
        results = await cognee.recall(
            full_query,
            session_id=SESSION_ID
        )
        responses = []
        sources = []
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    responses.append(r.answer)
                    sources.append("session")
                elif source_val == "graph" and getattr(r, 'text', None):
                    responses.append(r.text)
                    sources.append("graph")
        return responses, sources

    async def get_embedded_emotions():
        emotion_query = (
            f"Analyze the emotional content of this text: '{query}'. "
            "Identify the single strongest predominant secondary emotion "
            "or feeling state (e.g., Grateful, Reflective, Anxious, Motivated, Peaceful). "
            "Return just that single word."
        )
        results = await cognee.recall(emotion_query, session_id=SESSION_ID)
        if results:
            for r in results:
                val = getattr(r, 'answer', None) or getattr(r, 'text', None)
                if val and len(val.strip()) < 20:
                    return [val.strip()]
        return ["Neutral"]

    responses, sources = run_async(get_memory())
    detected_emotions = run_async(get_embedded_emotions()) if query else []

    return jsonify({
        "status": "success",
        "results": responses,
        "source": sources[0] if sources else "session",
        "emotions": detected_emotions
    })


@app.route('/api/forget', methods=['POST'])
def forget():
    data = request.json or {}
    dataset = data.get('dataset', 'main_dataset')

    async def delete():
        await cognee.forget(dataset=dataset)

    run_async(delete())
    return jsonify({"status": "success", "message": "Memory forgotten!"})


def get_memory_count():
    async def count_memories():
        results = await cognee.recall(
            "List everything you remember about me.",
            session_id=SESSION_ID
        )
        return len(results) if results else 0

    try:
        return run_async(count_memories())
    except Exception:
        return 0


@app.route('/api/stats', methods=['GET'])
def stats():
    mem_count = get_memory_count()
    return jsonify({
        "memories": mem_count,
        "days_active": 1,
        "goals_count": 0,
        "mnemo_score": 60 if mem_count > 0 else 0,
        "today_memories": [],
        "patterns": [],
        "active_goals": []
    })


@app.route('/api/insights', methods=['GET'])
def api_insights():
    query = (
        "Analyze my memories and describe my resilience, growth, "
        "consistency and positivity as percentages. Also describe "
        "my personality traits."
    )

    async def get_insight_text():
        results = await cognee.recall(query, session_id=SESSION_ID)
        combined = ""
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    combined += r.answer + " "
                elif source_val == "graph" and getattr(r, 'text', None):
                    combined += r.text + " "
        return combined.strip()

    insight_data = {
        "score": 0, "resilience": 0, "growth": 0,
        "consistency": 0, "positivity": 0,
        "dna": {"resilience": 0, "creativity": 0, "patience": 0,
                "determination": 0, "empathy": 0},
        "predictions": [{"text": "Not enough data yet", "confidence": 0}]
    }

    try:
        raw_text = run_async(get_insight_text())
        if not raw_text:
            return jsonify(insight_data)

        def extract_percent(keyword, text):
            pattern = rf"{keyword}[^\d]{{0,10}}(\d{{1,3}})\s*%"
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return max(0, min(int(match.group(1)), 100))
            return 0

        resilience   = extract_percent("resilience", raw_text)
        growth       = extract_percent("growth", raw_text)
        consistency  = extract_percent("consistency", raw_text)
        positivity   = extract_percent("positivity", raw_text)
        metrics      = [resilience, growth, consistency, positivity]
        score        = int(sum(metrics) / len(metrics)) if any(metrics) else 0

        dna = {
            "resilience":    resilience,
            "creativity":    extract_percent("creativity", raw_text),
            "patience":      extract_percent("patience", raw_text),
            "determination": extract_percent("determination", raw_text),
            "empathy":       extract_percent("empathy", raw_text)
        }

        sentences   = [s.strip() for s in raw_text.split('.') if s.strip()]
        predictions = [{"text": s, "confidence": 60} for s in sentences[:3]]
        if not predictions:
            predictions = [{"text": "Not enough data yet", "confidence": 0}]

        return jsonify({
            "score": score, "resilience": resilience, "growth": growth,
            "consistency": consistency, "positivity": positivity,
            "dna": dna, "predictions": predictions
        })

    except Exception:
        return jsonify(insight_data)


@app.route('/api/check-conflict', methods=['POST'])
def check_conflict():
    data = request.json or {}
    new_entry = data.get('new_entry', '')
    today = datetime.now().strftime("%Y_%m_%d")

    conflict_query = (
        f"Does this statement conflict with anything I've said before: "
        f"'{new_entry}'? If yes, describe the conflicting past statement "
        f"and the date if known. If no conflict, say 'NO_CONFLICT'."
    )

    async def get_conflict_check():
        results = await cognee.recall(conflict_query, session_id=f"day_{today}")
        responses = []
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    responses.append(r.answer)
                elif source_val == "graph" and getattr(r, 'text', None):
                    responses.append(r.text)
        return responses

    responses = run_async(get_conflict_check())
    full_text = " ".join(responses).strip()

    if not full_text or "no_conflict" in full_text.lower():
        return jsonify({"conflict": False, "message": ""})
    return jsonify({"conflict": True, "message": full_text})


@app.route('/api/battle', methods=['POST'])
def battle():
    query = (
        "Compare how I was thinking and feeling at the very beginning "
        "of my journey versus how I am now. Give me: one quote-style "
        "line representing 'past me', one quote-style line representing "
        "'present me', and a short verdict on who is winning and why. "
        "Also estimate a growth percentage (0-100) representing how "
        "much I've improved."
    )

    async def get_battle_text():
        results = await cognee.recall(query, session_id=SESSION_ID)
        combined = ""
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    combined += r.answer + " "
                elif source_val == "graph" and getattr(r, 'text', None):
                    combined += r.text + " "
        return combined.strip()

    try:
        raw_text = run_async(get_battle_text())

        if not raw_text:
            return jsonify({"status": "empty"})

        past_quote    = ""
        present_quote = ""
        growth_percent = 0

        past_match = re.search(
            r"past\s*(?:me)?[:\-—]?\s*[\"']([^\"']{3,200})[\"']",
            raw_text, re.IGNORECASE
        )
        if past_match:
            past_quote = past_match.group(1).strip()

        present_match = re.search(
            r"present\s*(?:me)?[:\-—]?\s*[\"']([^\"']{3,200})[\"']",
            raw_text, re.IGNORECASE
        )
        if present_match:
            present_quote = present_match.group(1).strip()

        growth_match = re.search(r"(\d{1,3})\s*%", raw_text)
        if growth_match:
            growth_percent = max(0, min(int(growth_match.group(1)), 100))

        if not past_quote and not present_quote:
            return jsonify({
                "status": "success",
                "past_quote": "",
                "present_quote": "",
                "verdict": raw_text,
                "growth_percent": 0
            })

        verdict = raw_text
        if past_match:
            verdict = verdict.replace(past_match.group(0), "")
        if present_match:
            verdict = verdict.replace(present_match.group(0), "")
        verdict = verdict.strip(" .,-—")[:400]

        value_verdict = verdict if verdict else "Your growth speaks for itself."

        return jsonify({
            "status": "success",
            "past_quote": past_quote,
            "present_quote": present_quote,
            "verdict": value_verdict,
            "growth_percent": growth_percent
        })

    except Exception:
        return jsonify({"status": "empty"})


@app.route('/api/mirror', methods=['POST'])
def mirror():
    mirror_query = (
        "Based on everything you know about me from my memories, "
        "describe who I truly am. Include: my core personality trait, "
        "my biggest strength, what I seem to fear most, my hidden "
        "superpower, my growth pattern (how I typically go from "
        "struggle to success), and what seems to drive me most. "
        "Be specific, warm, and reference actual patterns you've "
        "noticed, not generic statements."
    )

    async def get_mirror():
        results = await cognee.recall(mirror_query, session_id=SESSION_ID)
        responses = []
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    responses.append(r.answer)
                elif source_val == "graph" and getattr(r, 'text', None):
                    responses.append(r.text)
        return responses

    try:
        responses = run_async(get_mirror())
        if not responses:
            return jsonify({"status": "empty", "mirror_text": ""})
        return jsonify({"status": "success", "mirror_text": responses[0]})
    except Exception:
        return jsonify({"status": "empty", "mirror_text": ""})


@app.route('/api/emotion', methods=['POST'])
def emotion():
    data = request.json or {}
    text = data.get('text', '')

    emotion_query = (
        f"Analyze the emotional content of this text: '{text}'. "
        f"Return your analysis as percentages (0-100) for these exact "
        f"emotions: sadness, frustration, anxiety, determination, "
        f"happiness. Format strictly as: "
        f"sadness:NN,frustration:NN,anxiety:NN,determination:NN,happiness:NN"
    )

    memory_query = (
        f"I'm feeling this way: '{text}'. Have I felt this exact way "
        f"before? If yes, briefly mention when and what happened next. "
        f"If no similar past memory exists, say 'NO_SIMILAR_MEMORY'."
    )

    async def get_emotion_analysis():
        results = await cognee.recall(emotion_query, dataset_name="main_dataset")
        responses = []
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    responses.append(r.answer)
                elif source_val == "graph" and getattr(r, 'text', None):
                    responses.append(r.text)
        return " ".join(responses).strip()

    async def get_similar_memory():
        results = await cognee.recall(memory_query, dataset_name="main_dataset")
        responses = []
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    responses.append(r.answer)
                elif source_val == "graph" and getattr(r, 'text', None):
                    responses.append(r.text)
        return " ".join(responses).strip()

    raw_emotion_text = run_async(get_emotion_analysis())
    raw_memory_text = run_async(get_similar_memory())

    emotions = {
        "sadness": 0, "frustration": 0, "anxiety": 0,
        "determination": 0, "happiness": 0
    }
    status = "success"

    try:
        pairs = raw_emotion_text.replace(" ", "").split(",")
        parsed = {}
        for pair in pairs:
            key, value = pair.split(":")
            key = key.strip().lower()
            value = int(''.join(ch for ch in value if ch.isdigit()))
            parsed[key] = max(0, min(100, value))

        for key in emotions:
            if key in parsed:
                emotions[key] = parsed[key]
            else:
                raise ValueError("missing emotion key")
    except Exception:
        emotions = {k: 0 for k in emotions}
        status = "parse_error"

    similar_memory = ""
    if raw_memory_text and "no_similar_memory" not in raw_memory_text.lower():
        similar_memory = raw_memory_text

    return jsonify({
        "status": status,
        "emotions": emotions,
        "similar_memory": similar_memory
    })


@app.route('/api/coach', methods=['GET'])
def coach():
    """
    Generates a proactive 'coach mode' message — Mnemo acts like
    a personal life coach, giving today's mission based on memories.
    """
    coach_query = (
        "Act as my personal life coach. Based on my recent memories "
        "and patterns, give me: one specific challenge or mission for "
        "today, one observation about my likely energy level today "
        "based on past patterns, and one piece of direct advice. "
        "Keep it short, direct, and encouraging — like a coach who "
        "knows me well."
    )

    async def get_coach_message():
        results = await cognee.recall(coach_query, session_id=SESSION_ID)
        responses = []
        if results:
            for r in results:
                source_val = getattr(r, 'source', None)
                if source_val == "session" and getattr(r, 'answer', None):
                    responses.append(r.answer)
                elif source_val == "graph" and getattr(r, 'text', None):
                    responses.append(r.text)
        return responses

    try:
        responses = run_async(get_coach_message())
        if not responses:
            return jsonify({
                "status": "empty",
                "coach_message": "Start journaling so I can coach you based on your real patterns!"
            })
        return jsonify({"status": "success", "coach_message": responses[0]})
    except Exception:
        return jsonify({
            "status": "empty",
            "coach_message": "Start journaling so I can coach you based on your real patterns!"
        })


if __name__ == '__main__':
    app.run(debug=True, port=5000)