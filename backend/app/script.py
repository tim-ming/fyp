from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create database engine and session
engine = create_engine(
    f"postgresql://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASSWORD')}@localhost:5432/{os.environ.get('DB_NAME')}"
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def execute_sql_commands(commands):
    with engine.connect() as connection:
        for command in commands:
            connection.execute(text(command))
        connection.commit()

if __name__ == "__main__":
    add_columns = [
        """
        ALTER TABLE mood_entries 
        ADD COLUMN IF NOT EXISTS patient_data_id INTEGER REFERENCES patient_data(id);
        """,
        """
        ALTER TABLE journal_entries 
        ADD COLUMN IF NOT EXISTS patient_data_id INTEGER REFERENCES patient_data(id);
        """,
        """
        ALTER TABLE guided_journal_entries 
        ADD COLUMN IF NOT EXISTS patient_data_id INTEGER REFERENCES patient_data(id);
        """
    ]
    execute_sql_commands(add_columns)

    backfill_patient_data = """
    INSERT INTO patient_data (user_id)
    SELECT id FROM users
    WHERE is_therapist = FALSE
    AND id NOT IN (SELECT user_id FROM patient_data);
    """
    execute_sql_commands([backfill_patient_data])

    backfill_patient_data_id = [
        """
        UPDATE mood_entries 
        SET patient_data_id = (
            SELECT id FROM patient_data 
            WHERE patient_data.user_id = mood_entries.user_id
        );
        """,
        """
        UPDATE journal_entries 
        SET patient_data_id = (
            SELECT id FROM patient_data 
            WHERE patient_data.user_id = journal_entries.user_id
        );
        """,
        """
        UPDATE guided_journal_entries 
        SET patient_data_id = (
            SELECT id FROM patient_data 
            WHERE patient_data.user_id = guided_journal_entries.user_id
        );
        """
    ]

    execute_sql_commands(backfill_patient_data_id)

