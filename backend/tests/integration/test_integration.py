import os

import requests
import pytest
import base64
import io
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from app.database import Base
from PIL import Image
from datetime import date, timedelta

@pytest.fixture(scope="function")
def test_db():
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test_integration.db"

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
    if os.path.exists("test_integration.db"):
        os.remove("test_integration.db")


client = TestClient(app)


def test_assign_therapist_to_patient_and_fetch(test_db):
    client = test_db

    # create therapist
    response = client.post(
        "/signup",
        json={
            "email": "therapist@example.com",
            "name": "Therapist",
            "password": "therapistpassword",
            "role": "therapist",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "User created successfully"

    # create patient
    response = client.post(
        "/signup",
        json={
            "email": "patient@example.com",
            "name": "Patient",
            "password": "patientpassword",
            "role": "patient",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "User created successfully"

    # login as therapist
    login_response = client.post(
        "/signin",
        data={"username": "therapist@example.com", "password": "therapistpassword"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    therapist_headers = {"Authorization": f"Bearer {token}"}

    # login as patient
    login_response = client.post(
        "/signin",
        data={"username": "patient@example.com", "password": "patientpassword"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {token}"}

    # get therapist id
    response = client.get("/users/me", headers=therapist_headers)
    assert response.status_code == 200
    therapist = response.json()
    assert therapist["email"] == "therapist@example.com"
    therapist_id = therapist["id"]

    # assign therapist to patient
    response = client.post(f"/assign-therapist/{therapist_id}", headers=patient_headers)
    assert response.status_code == 200

    # fetch patients assigned to therapist
    response = client.get("/patients", headers=therapist_headers)
    assert response.status_code == 200
    patients = response.json()

    # verify the patient is correctly assigned to the therapist
    assert any(patient["email"] == "patient@example.com" for patient in patients)


def test_post_journal_and_depression_evaluation(test_db):
    client = test_db

    # create patient
    response = client.post(
        "/signup",
        json={
            "email": "patient@example.com",
            "name": "Patient",
            "password": "patientpassword",
            "role": "patient",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["detail"] == "User created successfully"

    # login as patient
    login_response = client.post(
        "/signin",
        data={"username": "patient@example.com", "password": "patientpassword"},
    )
    assert login_response.status_code == 200
    user = login_response.json()
    token = user["access_token"]
    patient_headers = {"Authorization": f"Bearer {token}"}

    # --- Journal testing ---
    # Checks if the journal entry is created and fetched correctly

    # Create a journal entry
    # Simulate an image by creating a base64 string
    img = Image.new("RGB", (100, 100), color="red")
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Create 5 happy journal entries
    happy_journal_entries = [
        {"title": "Happy Journal 1", "body": "Feeling great today!"},
        {"title": "Happy Journal 2", "body": "Had a wonderful breakfast."},
        {"title": "Happy Journal 3", "body": "Went for a refreshing walk."},
        {"title": "Happy Journal 4", "body": "Spent time with family."},
        {"title": "Happy Journal 5", "body": "Accomplished all my tasks."},
    ]

    for i, journal in enumerate(happy_journal_entries):
        date_str = (date.today() + timedelta(days=i)).isoformat()
        journal_entry_data = {
            "title": journal["title"],
            "body": journal["body"],
            "image": img_str,  # Same base64 image for all entries
            "date": date_str,
        }

        response = client.post(
            "/journals", json=journal_entry_data, headers=patient_headers
        )

        assert response.status_code == 200  # Entry should be created successfully

        created_entry = response.json()
        now = (date.today() + timedelta(days=i)).isoformat()
        assert created_entry["title"] == journal["title"]
        assert created_entry["body"] == journal["body"]
        assert "image" in created_entry  # Image should be saved
        assert created_entry["date"] == now

    # Fetch the journal entries and verify 5 entries were created
    get_response = client.get("/journals", headers=patient_headers)
    assert get_response.status_code == 200

    journal_entries = get_response.json()
    assert len(journal_entries) >= 5  # Ensure there are at least 5 entries

    # Verify that the 5 "happy" journals are present
    inputs = []
    for journal in happy_journal_entries:
        assert any(entry["title"] == journal["title"] for entry in journal_entries)

    for journal in journal_entries:
        inputs.append(
            {
                "text": journal["title"] + "\n" + journal["body"], 
                "timestamp": journal["date"], 
                "image": journal["image"] if journal["image"] else None,
            }
        )
        
    # --- End Journal testing ---

    # --- Depression Evaluation testing ---

    # call the depression evaluation endpoint
    model_endpoint = os.getenv("MODEL_ENDPOINT")
    get_response = requests.post(
        model_endpoint,
        json={"data": inputs},
    )
    assert get_response.status_code == 200

    # check if the risk is between 0 and 1
    details = get_response.json()
    assert details["probas"][0] >= 0 and details["probas"][0] <= 1