def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_keywords(client):
    response = client.get("/api/keywords")
    assert response.status_code == 200
    data = response.json()
    # Check that "All" option is added
    assert data[0]['keyword'] == "All"
    assert data[0]['count'] == 150  # 100 + 50
    # Check mock data
    assert len(data) == 3 # All + 2 mocks

def test_get_mentions(client):
    response = client.get("/api/mentions?keyword=Ozempic")
    assert response.status_code == 200
    data = response.json()
    assert "mentions" in data
    assert len(data['mentions']) == 1
    assert data['mentions'][0]['keyword'] == 'Ozempic'

def test_get_unique_authors(client):
    response = client.get("/api/stats/unique-authors?keyword=Ozempic")
    assert response.status_code == 200
    assert response.json() == {"count": 42}

def test_get_counts_by_day(client):
    response = client.get("/api/stats/counts-by-day")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]['date'] == '2023-01-01'

def test_get_sentiment(client):
    response = client.get("/api/stats/sentiment")
    assert response.status_code == 200
    data = response.json()
    assert data['positive'] == 5
