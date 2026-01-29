from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import psycopg2
from psycopg2 import pool, extras
import os
from datetime import datetime, timedelta

# --- Configuration ---
DB_HOST = os.getenv("DB_HOST", "drugsafety01.c9qieom8iu7y.us-east-1.rds.amazonaws.com")
DB_NAME = os.getenv("DB_NAME", "drugsafety")
DB_USER = os.getenv("DB_USER", "drugsafety_admin")
DB_PASS = os.getenv("DB_PASS", "sociallistner001")
DB_PORT = os.getenv("DB_PORT", "5432")

app = FastAPI(title="Drug Experience Explorer API", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database ---
try:
    db_pool = psycopg2.pool.SimpleConnectionPool(
        1, 10,
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )
    print("Database connection pool created.")
except Exception as e:
    print(f"Error creating connection pool: {e}")
    db_pool = None

def get_db_connection():
    if not db_pool:
        # For demo purposes if DB falls over, don't crash hard but valid DB is needed
        # In prod, this should definitely raise 500
        raise HTTPException(status_code=500, detail="Database connection failed")
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)

# --- Models ---
class KeywordStats(BaseModel):
    keyword: str
    count: int

class Mention(BaseModel):
    id: int
    author: Optional[str]
    content: Optional[str]
    date: str
    source: str = "Reddit"
    url: Optional[str]
    sentiment: Optional[str]
    keyword: str

class CountByDay(BaseModel):
    date: str
    count: int
    sentiment: Optional[str] = None

class AuthorStat(BaseModel):
    author: str
    count: int

# --- Endpoints ---


# --- Rule Models ---
class RuleCreate(BaseModel):
    title: str
    instruction: str

class Rule(RuleCreate):
    id: int
    created_at: Optional[datetime]

# --- Database Initialization ---
def init_db():
    """Initialize database tables if they don't exist."""
    conn = get_db_connection_sync() # Helper to get single conn
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS saved_rules (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    instruction TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            print("Table 'saved_rules' checked/created.")
    except Exception as e:
        print(f"DB Init Error: {e}")
    finally:
        conn.close()

def get_db_connection_sync():
    """Helper for startup initialization independent of request scope."""
    if not db_pool: return None
    return db_pool.getconn()

# Initialize on startup
# (In a real app, use @app.on_event("startup"))
# For this script, we'll call it if pool exists.
if db_pool:
    init_db()


# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ... (Existing /api/keywords) ...

@app.get("/api/keywords", response_model=List[KeywordStats])
def get_keywords(conn=Depends(get_db_connection)):
    """Get list of monitored keywords and their total mention counts."""
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute("""
            SELECT keyword, COUNT(*) as count 
            FROM kwatch_alert_results 
            WHERE keyword IS NOT NULL
            GROUP BY keyword 
            ORDER BY count DESC
        """)
        results = cur.fetchall()
        
        # Add "All" option
        total = sum(r['count'] for r in results)
        response = [{"keyword": "All", "count": total}]
        # Map DB results
        response.extend([{"keyword": r['keyword'], "count": r['count']} for r in results])
        return response

@app.get("/api/mentions")
def get_mentions(
    keyword: str = "All",
    start: str = None,
    end: str = None,
    limit: int = 50,
    offset: int = 0,
    include_raw: bool = False,
    conn=Depends(get_db_connection)
):
    """Get a paginated list of mentions."""
    query = "SELECT id, author, content, received_at, url, sentiment, keyword FROM kwatch_alert_results WHERE 1=1"
    params = []

    if keyword != "All":
        query += " AND keyword = %s"
        params.append(keyword)
    
    if start:
        query += " AND received_at >= %s"
        params.append(start)
    if end:
        query += " AND received_at <= %s"
        params.append(end)

    query += " ORDER BY received_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        
        results = []
        for row in rows:
            results.append({
                "id": row['id'],
                "author": row['author'],
                "content": row['content'],
                "date": row['received_at'].isoformat() if row['received_at'] else None,
                "url": row['url'],
                "sentiment": row['sentiment'] or 'neutral',
                "keyword": row['keyword'],
                "source": "Reddit"
            })
            
        return {"mentions": results}

@app.get("/api/stats/unique-authors")
def get_unique_authors(
    keyword: str = Query("All"),
    start: Optional[str] = None,
    end: Optional[str] = None,
    conn=Depends(get_db_connection)
):
    """Get count of unique authors."""
    query = "SELECT COUNT(DISTINCT author) as count FROM kwatch_alert_results WHERE 1=1"
    params = []

    if keyword != "All":
        query += " AND keyword = %s"
        params.append(keyword)
    if start:
        query += " AND received_at >= %s"
        params.append(start)
    if end:
        query += " AND received_at <= %s"
        params.append(end)

    with conn.cursor() as cur:
        cur.execute(query, tuple(params))
        result = cur.fetchone()
        return {"count": result[0]}

@app.get("/api/stats/authors", response_model=List[AuthorStat])
def get_author_list(
    keyword: str = Query("All"),
    limit: int = 50,
    conn=Depends(get_db_connection)
):
    """Get list of top authors for Authors Tab."""
    query = """
        SELECT author, COUNT(*) as count
        FROM kwatch_alert_results
        WHERE 1=1
    """
    params = []
    
    if keyword != "All":
        query += " AND keyword = %s"
        params.append(keyword)
        
    query += " GROUP BY author ORDER BY count DESC LIMIT %s"
    params.append(limit)
    
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return [{"author": r['author'], "count": r['count']} for r in rows]

@app.get("/api/stats/counts-by-day", response_model=List[CountByDay])
def get_counts_by_day(
    keyword: str = Query("All"),
    conn=Depends(get_db_connection)
):
    """Get mention counts aggregated by day."""
    query = """
        SELECT DATE(received_at) as date, COUNT(*) as count 
        FROM kwatch_alert_results 
        WHERE 1=1
    """
    params = []
    
    if keyword != "All":
        query += " AND keyword = %s"
        params.append(keyword)

    query += " GROUP BY DATE(received_at) ORDER BY date ASC"

    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return [{"date": str(row['date']), "count": row['count']} for row in rows]

@app.get("/api/stats/sentiment")
def get_sentiment_groups(
    keyword: str = Query("All"),
    conn=Depends(get_db_connection)
):
    """Get sentiment distribution."""
    query = "SELECT sentiment, COUNT(*) as count FROM kwatch_alert_results WHERE 1=1"
    params = []

    if keyword != "All":
        query += " AND keyword = %s"
        params.append(keyword)
        
    query += " GROUP BY sentiment"

    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return { (row['sentiment'] or 'unknown'): row['count'] for row in rows }

# --- Rules CRUD ---

@app.get("/api/rules", response_model=List[Rule])
def get_rules(conn=Depends(get_db_connection)):
    """Fetch all persisted rules."""
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute("SELECT id, title, instruction, created_at FROM saved_rules ORDER BY id ASC")
        rows = cur.fetchall()
        return [dict(row) for row in rows]

@app.post("/api/rules", response_model=Rule)
def create_or_update_rule(rule: RuleCreate, id: Optional[int] = Query(None), conn=Depends(get_db_connection)):
    """Create a new rule or update if exists (logic simplified for MVP)."""
    # For MVP, we'll just Insert. Simple Create.
    # User said "Input saved in the back".
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        if id:
            # Update
            cur.execute(
                "UPDATE saved_rules SET title = %s, instruction = %s WHERE id = %s RETURNING id, title, instruction, created_at",
                (rule.title, rule.instruction, id)
            )
        else:
            # Create
            cur.execute(
                "INSERT INTO saved_rules (title, instruction) VALUES (%s, %s) RETURNING id, title, instruction, created_at",
                (rule.title, rule.instruction)
            )
        conn.commit()
        new_row = cur.fetchone()
        if not new_row:
             raise HTTPException(status_code=404, detail="Rule not found")
        return dict(new_row)

@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: int, conn=Depends(get_db_connection)):
    """Delete a rule."""
    with conn.cursor() as cur:
        cur.execute("DELETE FROM saved_rules WHERE id = %s", (rule_id,))
        conn.commit()
    return {"status": "deleted", "id": rule_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
