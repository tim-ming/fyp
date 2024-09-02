1. go to `backend/app`
2. create `.env` file like

```
DB_USER = 'mcs01'
DB_PASSWORD = 'mcs01-is-awesome'
DB_NAME = 'mcs01'

TOKEN_SECRET_KEY = 'mcs01-is-awesome'
```

3. `run docker-composeup -d`
4. go back to `backend/`
5. run `poetry install`
6. `poetry shell`
7. `python3 run.py`
