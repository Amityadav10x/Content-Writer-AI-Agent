import sqlite3
import json
import os
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

class MemorySignal(BaseModel):
    key: str
    value: Any
    category: str  # strategy, style, behavior
    importance: float = 0.5
    confidence: float = 1.0
    frequency: int = 1
    last_seen: datetime = Field(default_factory=datetime.now)
    version: int = 1
    embedding: Optional[List[float]] = None

class MemoryManager:
    def __init__(self, db_path: str = "memory.db"):
        self.db_path = db_path
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_memory (
                    user_id TEXT,
                    signal_key TEXT,
                    category TEXT,
                    value TEXT,
                    importance REAL,
                    frequency INTEGER,
                    confidence REAL,
                    last_seen TIMESTAMP,
                    version INTEGER,
                    embedding BLOB,
                    PRIMARY KEY (user_id, signal_key)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS memory_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    signal_key TEXT,
                    old_value TEXT,
                    new_value TEXT,
                    change_reason TEXT,
                    timestamp TIMESTAMP
                )
            """)

    def _get_embedding(self, text: str) -> List[float]:
        if not self.client:
            return []
        try:
            res = self.client.models.embed_content(
                model="text-embedding-004",
                contents=text,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
            )
            return res.embeddings[0].values
        except Exception as e:
            print(f"Embedding error: {e}")
            return []

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2: return 0.0
        dot = sum(a*b for a,b in zip(v1, v2))
        mag1 = math.sqrt(sum(a*a for a in v1))
        mag2 = math.sqrt(sum(b*b for b in v2))
        return dot / (mag1 * mag2) if mag1 * mag2 else 0.0

    def retrieve_relevant_memory(self, user_id: str, topic: str, top_k: int = 10) -> Dict[str, List[MemorySignal]]:
        topic_embedding = self._get_embedding(topic)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM user_memory WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()

        signals = []
        now = datetime.now()

        for row in rows:
            # Parse signal
            sig_embedding = json.loads(row['embedding']) if row['embedding'] else []
            
            # 1. Semantic Similarity
            semantic_sim = self._cosine_similarity(topic_embedding, sig_embedding) if sig_embedding else 0.5
            
            # 2. Time Decay (λ = 0.05)
            last_seen = datetime.fromisoformat(row['last_seen'])
            days_passed = (now - last_seen).days
            decay = math.exp(-0.05 * days_passed)
            
            # 3. RFI Score
            rfi_score = (row['importance'] * 0.5) + (min(row['frequency'] / 10.0, 1.0) * 0.3) + (decay * 0.2)
            
            # 4. Final Hybrid Score
            final_score = semantic_sim * rfi_score
            
            signals.append({
                "data": MemorySignal(
                    key=row['signal_key'],
                    value=json.loads(row['value']),
                    category=row['category'],
                    importance=row['importance'],
                    confidence=row['confidence'],
                    frequency=row['frequency'],
                    last_seen=last_seen,
                    version=row['version']
                ),
                "score": final_score
            })

        # Sort by score and take top K
        signals.sort(key=lambda x: x["score"], reverse=True)
        top_signals = signals[:top_k]

        # Group by category
        grouped = {"strategy": [], "style": [], "behavior": []}
        for s in top_signals:
            grouped[s["data"].category].append(s["data"])
            
        return grouped

    def store_signal(self, user_id: str, signal: MemorySignal, reason: str = "Self-extraction"):
        embedding = self._get_embedding(f"{signal.category} {signal.key}")
        embedding_json = json.dumps(embedding)

        with sqlite3.connect(self.db_path) as conn:
            # Check for existing
            cursor = conn.execute(
                "SELECT value, version, frequency FROM user_memory WHERE user_id = ? AND signal_key = ?", 
                (user_id, signal.key)
            )
            existing = cursor.fetchone()

            if existing:
                old_val = existing[0]
                new_val = json.dumps(signal.value)
                
                # Update logic
                if old_val != new_val:
                    # Versioning & History
                    conn.execute("""
                        INSERT INTO memory_history (user_id, signal_key, old_value, new_value, change_reason, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (user_id, signal.key, old_val, new_val, reason, datetime.now().isoformat()))
                    
                    version = existing[1] + 1
                else:
                    version = existing[1]

                conn.execute("""
                    UPDATE user_memory SET 
                        value = ?, frequency = frequency + 1, last_seen = ?, 
                        importance = ?, confidence = ?, version = ?, embedding = ?
                    WHERE user_id = ? AND signal_key = ?
                """, (new_val, datetime.now().isoformat(), signal.importance, signal.confidence, version, embedding_json, user_id, signal.key))
            else:
                # Insert new
                conn.execute("""
                    INSERT INTO user_memory (user_id, signal_key, category, value, importance, frequency, confidence, last_seen, version, embedding)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user_id, signal.key, signal.category, json.dumps(signal.value), signal.importance, 1, signal.confidence, datetime.now().isoformat(), 1, embedding_json))

    def prune_memory(self, user_id: str, threshold: float = 0.1):
        """Removes low-scoring/stale memory signals."""
        # Simple implementation: remove if not seen for 90 days and low frequency
        cutoff = (datetime.now() - timedelta(days=90)).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM user_memory WHERE user_id = ? AND last_seen < ? AND frequency < 3", (user_id, cutoff))
