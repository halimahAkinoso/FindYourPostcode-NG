# FindMe NG — Smart Address and Delivery Assistant

Problem: incomplete addresses, confusing directions.
Solution: Find official postcode via NIPOST API + AI fuzzy, validate, collect phone+landmark, save structured delivery record, help vendor organize + locate.

## Stack
React (Vite) + Tailwind, FastAPI, SQLAlchemy SQLite, AI parser (TF-IDF), NIPOST API integration.

## Quick start

### Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# edit .env and add NIPOST_API_KEY if you have it
uvicorn app.main:app --reload --port 8000
Docs: http://localhost:8000/docs

### Frontend
cd frontend
npm install
npm run dev
App: http://localhost:5173

Env: create frontend/.env
VITE_API_URL=http://localhost:8000

## NIPOST Real Integration
1. Get API key from NIPOST (https://nipost.gov.ng)
2. Put in backend/.env:
NIPOST_API_KEY=xxxx
NIPOST_BASE=https://api.nipost.gov.ng/v1/postcode

If key missing, app automatically uses local high-accuracy fallback DB with confidence scoring — so demo never breaks.

## Features
1. Find postcode: state/LGA/town/street -> NIPOST lookup
2. Validate postcode: official service
3. Collect supplementary: phone (NG validation), landmark, building desc
4. Save delivery record: FastAPI + DB
5. Vendor organize: filter, search, status update, one-click Google Maps + phone call

## Deploy
Backend: Render / Railway / Fly.io
Frontend: Vercel
DB: switch DATABASE_URL to Postgres in production.
