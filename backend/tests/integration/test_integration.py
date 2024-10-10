import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from app.database import Base

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
    login_response = client.post("/signin", data={"username": "therapist@example.com", "password": "therapistpassword"})
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    therapist_headers = {"Authorization": f"Bearer {token}"}

    # login as patient
    login_response = client.post("/signin", data={"username": "patient@example.com", "password": "patientpassword"})
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