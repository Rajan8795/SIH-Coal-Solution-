# 🛡️ CoalGuard AI

AI-powered coal mine safety and monitoring platform developed for Smart India Hackathon (SIH).

## 🚀 Overview

CoalGuard AI is designed to monitor coal-mining operations, identify safety risks, manage alerts, inspections and compliance, and provide intelligent assistance through an AI interface.

## ✨ Key Features

- 🗺️ Mine monitoring dashboard
- ⚠️ Safety alerts
- ⛏️ Mine and field operations monitoring
- 📋 Inspection management
- 📊 Compliance tracking
- 👷 Contractor management
- 🤖 AI-powered assistance
- 📈 Reports and analytics

## 🏗️ Technology Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

## 📁 Project Structure

```text
SIH-Coal-Solution-
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts

# Mining Compliance Security App

## Features

- 🔐 JWT-based authentication with role-based access control (RBAC)
- 👥 Multi-role support (Admin, Inspector, Contractor)
- 📄 Secure document upload with malware scanning (ClamAV)
- 📝 Audit logging for all critical actions
- 🔒 HTTPS/TLS encryption
- ⏱️ API rate limiting
- 🛡️ OWASP Top 10 compliant security headers

## Tech Stack

- **Backend:** FastAPI, Python 3.12
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **Auth:** JWT (python-jose), Argon2 password hashing
- **Security:** slowapi (rate limiting), secure (headers), ClamAV (file scanning)

## Project Structure
app/
├── core/ # Config, security utils, dependencies
├── models/ # Database models
├── routers/ # API endpoints
├── schemas/ # Pydantic schemas
└── main.py # App entrypoint

## Setup

```bash
git clone <repo-url>
cd sih-security
python -m venv venv
venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values:
```bash
copy .env.example .env
```

Run the app:
```bash
uvicorn app.main:app --reload
```

For local HTTPS testing:
```bash
uvicorn app.main:app --reload --port 8443 --ssl-keyfile localhost-key.pem --ssl-certfile localhost.pem
```

## API Docs

Once running, visit `/docs` for interactive Swagger UI.

## Contributors

| Name | Feature Branch |
|---|---|
| — | `feature/frontend` |
| — | `feature/ml` |
| — | `feature/security-hardening` |

## Branching Workflow

1. Create a feature branch from `main`
2. Commit and push to your branch
3. Open a Pull Request for review before merging

Made with ❤️ by Rajan Prajapati, Amit Kumar Yadav, Anshika Mishra, Aryan Chaudhary, Tanya agarwal, Riddhika Agarwal
