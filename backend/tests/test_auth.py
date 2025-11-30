def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123", "full_name": "Test User"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_login_user(client):
    # Register first
    client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"}
    )
    
    # Login
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["token"]
    assert data["token"]["token_type"] == "bearer"
