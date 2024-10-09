import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from app.database import Base

@pytest.fixture(scope="function")
def test_db():
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test_signup.db"

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    Base.metadata.create_all(bind=engine)

    client = TestClient(app)

    yield client  

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("test_signup.db"):
        os.remove("test_signup.db")

def test_signup_successful(test_db):
    client = test_db
    response = client.post(
        "/signup",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "newuserpassword",
            "role": "patient",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "User created successfully"

    signin_response = client.post(
        "/signin",
        data={"username": "newuser@example.com", "password": "newuserpassword"},
    )
    assert signin_response.status_code == 200
    signin_data = signin_response.json()
    assert "access_token" in signin_data
    assert signin_data["token_type"] == "bearer"

def test_get_current_user_profile(test_db):
    client = test_db

    user_data = {
        "email": "profileuser@example.com",
        "name": "Profile User",
        "password": "profilepassword",
        "role": "patient",
    }

    signup_response = client.post("/signup", json=user_data)
    assert signup_response.status_code == 200

    signin_response = client.post(
        "/signin",
        data={"username": user_data["email"], "password": user_data["password"]},
    )
    assert signin_response.status_code == 200
    access_token = signin_response.json()["access_token"]

    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    expected_status_code = 200
    expected_response = {
        "email": user_data["email"],
        "name": user_data["name"],
        "role": user_data["role"],
    }

    actual_status_code = response.status_code
    actual_response = response.json()

    assert actual_status_code == expected_status_code
    assert actual_response["email"] == expected_response["email"]
    assert actual_response["name"] == expected_response["name"]
    assert actual_response["role"] == expected_response["role"]
    assert "hashed_password" not in actual_response 
