from fastapi import FastAPI, HTTPException, Query, Depends
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import psycopg2
from psycopg2 import pool, extras
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI

# Load local .env if it exists
load_dotenv()

# --- Configuration ---
DB_HOST = os.getenv("DB_HOST", "drugsafety01.c9qieom8iu7y.us-east-1.rds.amazonaws.com")
DB_NAME = os.getenv("DB_NAME", "drugsafety")
DB_USER = os.getenv("DB_USER", "drugsafety_admin")
DB_PASS = os.getenv("DB_PASS", "sociallistner001")
DB_PORT = os.getenv("DB_PORT", "5432")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(
    title="Drug Experience Explorer API",
    description="Backend services for analyzing drug mentions and sentiment from social media and clinical sources.",
    version="1.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

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

class RuleExecuteRequest(BaseModel):
    rule_id: int
    previous_result: Optional[Dict] = None
    keywords: Optional[List[str]] = ["All"]
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ExecutionResult(BaseModel):
    status: str
    data: Optional[List[Dict]] = None
    message: Optional[str] = None
    sql: Optional[str] = None

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

@app.get("/health", tags=["Core"], summary="Health Check")
def health_check():
    """Verify that the API service is alive and healthy."""
    return {"status": "ok"}

# ... (Existing /api/keywords) ...

@app.get("/api/keywords", response_model=List[KeywordStats], tags=["Analytics"], summary="Get Keywords")
def get_keywords(conn=Depends(get_db_connection)):
    """
    Fetch all monitored drug keywords and their mention counts.
    Returns a list of keywords sorted by frequency, including a special 'All' entry for aggregation.
    """
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute("""
            SELECT keyword, COUNT(*) as count 
            FROM kwatch_alert_results 
            WHERE keyword IS NOT NULL AND author != 'AutoModerator'
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

def build_keyword_filter(keywords: List[str]):
    """Helper to build SQL and params for keyword filtering."""
    if "All" in keywords or not keywords:
        return "", []
    
    # Filter keywords (exclude 'All' if it's there but others are too)
    clean_keywords = [k for k in keywords if k != "All"]
    if not clean_keywords:
        return "", []

    sql = " AND keyword IN %s"
    params = [tuple(clean_keywords)]
    return sql, params

@app.get("/api/mentions", tags=["Data"], summary="Get Mentions")
def get_mentions(
    keyword: List[str] = Query(["All"], description="Filter by one or more keywords"),
    start: str = Query(None, description="Start date (ISO 8601)"),
    end: str = Query(None, description="End date (ISO 8601)"),
    limit: int = Query(50, ge=1, le=200, description="Paginated page size"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    include_raw: bool = Query(False, description="Whether to include raw payload in response"),
    conn=Depends(get_db_connection)
):
    """
    Retrieve a paginated list of social media mentions filtered by keyword and date range.
    Automatically excludes 'AutoModerator' and other bot content.
    """
    query = "SELECT id, author, content, received_at, url, sentiment, keyword FROM kwatch_alert_results WHERE author != 'AutoModerator'"
    params = []

    kw_sql, kw_params = build_keyword_filter(keyword)
    query += kw_sql
    params.extend(kw_params)
    
    if start:
        query += " AND received_at >= %s"
        params.append(start)
    if end:
        query += " AND received_at <= %s"
        params.append(end)

    query += " ORDER BY received_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        # Get total count for these filters
        count_query = "SELECT COUNT(*) FROM kwatch_alert_results WHERE author != 'AutoModerator'" + kw_sql
        cur.execute(count_query, tuple(kw_params))
        total_count = cur.fetchone()['count']

        # Get actual mentions
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
            
        return {"mentions": results, "total": total_count}

@app.get("/api/stats/unique-authors", tags=["Analytics"], summary="Get Unique Author Count")
def get_unique_authors(
    keyword: List[str] = Query(["All"]),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    conn=Depends(get_db_connection)
):
    """Returns the total number of distinct authors matching the provided filters."""
    query = "SELECT COUNT(DISTINCT author) as count FROM kwatch_alert_results WHERE author != 'AutoModerator'"
    params = []

    kw_sql, kw_params = build_keyword_filter(keyword)
    query += kw_sql
    params.extend(kw_params)
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

@app.get("/api/stats/authors", tags=["Analytics"], summary="Get Author Leadership List")
def get_author_list(
    keyword: List[str] = Query(["All"]),
    limit: int = Query(50),
    offset: int = Query(0),
    conn=Depends(get_db_connection)
):
    """Retrieves a paginated list of authors with their respective mention counts."""
    base_query = """
        FROM kwatch_alert_results
        WHERE author != 'AutoModerator'
    """
    kw_sql, kw_params = build_keyword_filter(keyword)
    base_query += kw_sql
    
    # Get total count
    count_query = "SELECT COUNT(DISTINCT author) " + base_query
    
    # Get actual data
    data_query = "SELECT author, COUNT(*) as count " + base_query + " GROUP BY author ORDER BY count DESC LIMIT %s OFFSET %s"
    
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        # Count total unique authors
        cur.execute(count_query, tuple(kw_params))
        total_count = cur.fetchone()['count']
        
        # Get paginated authors
        params = list(kw_params) + [limit, offset]
        cur.execute(data_query, tuple(params))
        rows = cur.fetchall()
        
        return {
            "authors": [{"author": r['author'], "count": r['count']} for r in rows],
            "total": total_count
        }

@app.get("/api/stats/counts-by-day", response_model=List[CountByDay], tags=["Analytics"], summary="Get Trends by Day")
def get_counts_by_day(
    keyword: List[str] = Query(["All"]),
    conn=Depends(get_db_connection)
):
    """Get frequency of mentions aggregated by calendar day useful for trend charts."""
    query = """
        SELECT DATE(received_at) as date, COUNT(*) as count 
        FROM kwatch_alert_results 
        WHERE author != 'AutoModerator'
    """
    params = []
    
    kw_sql, kw_params = build_keyword_filter(keyword)
    query += kw_sql
    params.extend(kw_params)

    query += " GROUP BY DATE(received_at) ORDER BY date ASC"

    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return [{"date": str(row['date']), "count": row['count']} for row in rows]

@app.get("/api/stats/sentiment", tags=["Analytics"], summary="Get Sentiment Distribution")
def get_sentiment_groups(
    keyword: List[str] = Query(["All"]),
    conn=Depends(get_db_connection)
):
    """Returns a mapping of sentiment labels to their respective frequency counts."""
    query = "SELECT sentiment, COUNT(*) as count FROM kwatch_alert_results WHERE author != 'AutoModerator'"
    params = []

    kw_sql, kw_params = build_keyword_filter(keyword)
    query += kw_sql
    params.extend(kw_params)
        
    query += " GROUP BY sentiment"

    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return { (row['sentiment'] or 'unknown'): row['count'] for row in rows }

# --- Rules CRUD ---

@app.get("/api/rules", response_model=List[Rule], tags=["Rules"], summary="List Analysis Rules")
def get_rules(conn=Depends(get_db_connection)):
    """Fetch all persisted user analysis rules."""
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute("SELECT id, title, instruction, created_at FROM saved_rules ORDER BY id ASC")
        rows = cur.fetchall()
        return [dict(row) for row in rows]

@app.post("/api/rules", response_model=Rule, tags=["Rules"], summary="Create or Update Rule")
def create_or_update_rule(
    rule: RuleCreate, 
    id: Optional[int] = Query(None, description="Provide ID to update an existing rule"), 
    conn=Depends(get_db_connection)
):
    """Persist a new analysis rule or update an existing one based on the ID parameter."""
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

@app.delete("/api/rules/{rule_id}", tags=["Rules"], summary="Delete Rule")
def delete_rule(rule_id: int, conn=Depends(get_db_connection)):
    """Remove a rule from the database permanently."""
    with conn.cursor() as cur:
        cur.execute("DELETE FROM saved_rules WHERE id = %s", (rule_id,))
        conn.commit()
    return {"status": "deleted", "id": rule_id}

@app.post("/api/rules/execute", tags=["Rules"], summary="Execute Rule (ChatGPT)")
def execute_rule(req: RuleExecuteRequest, conn=Depends(get_db_connection)):
    """
    Translates a natural language rule into SQL via ChatGPT and executes it.
    Supports chaining by considering previous results in the prompt context.
    Injects current application state (filters) into the prompt.
    """
    if not OPENAI_API_KEY:
        return {
            "status": "error", 
            "message": "OpenAI API Key is missing. Please configure OPENAI_API_KEY in the environment."
        }

    # 1. Fetch Rule
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        cur.execute("SELECT instruction FROM saved_rules WHERE id = %s", (req.rule_id,))
        rule_row = cur.fetchone()
        if not rule_row:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        instruction = rule_row['instruction']

    # 2. Fetch context (latest data sample matching filters if possible)
    context_data = []
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        # We try to fetch some samples that match the current user filters to give relevant context
        sample_query = "SELECT author, content, sentiment, keyword, received_at FROM kwatch_alert_results WHERE author != 'AutoModerator'"
        sample_params = []
        
        kw_sql, kw_params = build_keyword_filter(req.keywords)
        sample_query += kw_sql
        sample_params.extend(kw_params)
        
        if req.start_date:
            sample_query += " AND received_at >= %s"
            sample_params.append(req.start_date)
        if req.end_date:
            sample_query += " AND received_at <= %s"
            sample_params.append(req.end_date)
            
        sample_query += " ORDER BY received_at DESC LIMIT 10"
        
        cur.execute(sample_query, tuple(sample_params))
        context_data = cur.fetchall()
        # Convert datetimes for serializability
        for r in context_data:
            if r['received_at']: r['received_at'] = r['received_at'].isoformat()

    # 3. Build Prompt
    system_prompt = f"""
    You are an expert Data Analyst and SQL Engineer for "Drug Experience Explorer" (DXE).
    Target Database: PostgreSQL
    Main Table: kwatch_alert_results
    
    Columns & Data Types:
    - id (SERIAL): Primary Key
    - date_text (TEXT): Original date string from source
    - author (TEXT): Reddit username (Exclude 'AutoModerator')
    - url (TEXT): Permalink to the post
    - content (TEXT): The post body/text
    - sentiment (TEXT): 'positive', 'negative', 'neutral'
    - received_at (TIMESTAMP): When the data was ingested
    - kwatch_query (TEXT): The alert query name
    - keyword (TEXT): The drug keyword associated (e.g., 'Zepbound')

    User's Current Application state:
    - Selected Keywords: {req.keywords}
    - Date Range: {req.start_date or 'Ever'} to {req.end_date or 'Now'}

    Rules:
    - Respond ONLY with a valid JSON object.
    - If the instruction requires data retrieval, return: {{"type": "sql", "query": "SELECT ...", "explanation": "..."}}
    - If the instruction is a direct question or metadata request, return: {{"type": "text", "content": "...", "explanation": "..."}}
    - ALWAYS ensure SQL queries are valid PostgreSQL syntax.
    - IMPORTANT: If writing SQL, ensure you use the context of 'Selected Keywords' and 'Date Range' if it makes sense for the user's request, but prioritize the 'Natural Language Rule' explicit instructions.
    - Exclude bots (author != 'AutoModerator').
    """
    
    user_prompt = f"Natural Language Rule: {instruction}\n\n"
    
    if req.previous_result:
        # Truncate previous data if too large to avoid token limit issues
        prev_data_sample = str(req.previous_result.get('data', []))[:2000]
        user_prompt += f"Previous Rule Result Context (Chaining): {prev_data_sample}\n\n"
    
    user_prompt += f"Recent Data Context (Latest 10 samples matching current filters): {json.dumps(context_data)}\n\n"
    user_prompt += "Target: Generate the SQL or textual analysis based on the rule."

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        gpt_raw = response.choices[0].message.content
        gpt_res = json.loads(gpt_raw)
        
        if gpt_res.get("type") == "sql":
            sql = gpt_res.get("query")
            with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
                cur.execute(sql)
                rows = cur.fetchall()
                # Serialized datetimes for JSON response
                for r in rows:
                    for k, v in r.items():
                        if isinstance(v, datetime):
                            r[k] = v.isoformat()
                return {
                    "status": "success", 
                    "data": rows, 
                    "sql": sql, 
                    "explanation": gpt_res.get("explanation")
                }
        else:
            return {
                "status": "success", 
                "message": gpt_res.get("content"),
                "explanation": gpt_res.get("explanation")
            }

    except Exception as e:
        print(f"GPT/SQL Error: {e}")
        return {"status": "error", "message": f"Execution failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
