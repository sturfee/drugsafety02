import pytest
from unittest.mock import MagicMock
import sys
import os

# Add parent dir to sys.path to import api_service
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api_service import app, get_db_connection

# Mock Data
MOCK_KEYWORDS = [
    {'keyword': 'Ozempic', 'count': 100},
    {'keyword': 'Wegovy', 'count': 50}
]

MOCK_MENTIONS = [
    {
        'id': 1,
        'author': 'user1',
        'content': 'Test content',
        'received_at': '2023-01-01T12:00:00',
        'url': 'http://test.com',
        'sentiment': 'positive',
        'keyword': 'Ozempic'
    }
]

@pytest.fixture
def mock_db_cursor():
    cursor = MagicMock()
    
    # Configure cursor behavior based on executed query
    def execute_side_effect(query, params=None):
        query_str = query.strip().upper()
        if "SELECT KEYWORD" in query_str:
            cursor.fetchall.return_value = MOCK_KEYWORDS
        elif "SELECT ID" in query_str:
            cursor.fetchall.return_value = MOCK_MENTIONS
            cursor.fetchone.return_value = MOCK_MENTIONS[0]
        elif "COUNT(DISTINCT AUTHOR)" in query_str:
            cursor.fetchone.return_value = [42]
        elif "GROUP BY DATE" in query_str:
             cursor.fetchall.return_value = [{'date': '2023-01-01', 'count': 10}]
        elif "GROUP BY SENTIMENT" in query_str:
             cursor.fetchall.return_value = [{'sentiment': 'positive', 'count': 5}]
    
    cursor.execute.side_effect = execute_side_effect
    return cursor

@pytest.fixture
def mock_db_connection(mock_db_cursor):
    conn = MagicMock()
    conn.cursor.return_value.__enter__.return_value = mock_db_cursor
    return conn

@pytest.fixture
def client(mock_db_connection):
    # Override dependency
    app.dependency_overrides[get_db_connection] = lambda: mock_db_connection
    from fastapi.testclient import TestClient
    return TestClient(app)
