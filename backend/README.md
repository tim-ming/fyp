1. go to `backend/app`
2. create `.env` file like

```
DB_USER = 'mcs01'
DB_PASSWORD = 'mcs01-is-awesome'
DB_NAME = 'mcs01'

TOKEN_SECRET_KEY = 'mcs01-is-awesome'
```

1. `docker-composeup -d`
2. go back to `backend/`
3. `poetry install`
4. `poetry shell`
5. `python3 run.py`

To update the database schema:

1. `cd backend/app`,
2. `alembic upgrade head `
