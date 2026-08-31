# SnapUI Backend

FastAPI backend for the SnapUI frontend.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Docs

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
