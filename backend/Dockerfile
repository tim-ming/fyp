FROM python:3.9

WORKDIR /app

RUN pip install poetry

# Copy only dependency files first
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev

# Copy the rest of the application
COPY . .

EXPOSE 8000

# Create an entrypoint script
RUN echo '#!/bin/sh\n\
cd /app/app/\n\
poetry run alembic upgrade head\n\
cd /app\n\
exec poetry run python run.py' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]