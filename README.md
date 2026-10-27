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

## Deploy to Render

### Option 1: Render Blueprint (Automatic — Recommended)
This repository contains a `render.yaml` blueprint that deploys both backend and frontend automatically:
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Blueprint**.
2. Connect your GitHub repository (`FindYourPostcode-NG`).
3. Click **Apply**. Render will automatically configure both services:
   - **findme-backend**: Python FastAPI Web Service (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
   - **findme-frontend**: React + Vite Static Site (`npm run build`, output `./dist`) with `VITE_API_URL` linked to the backend URL.

### Option 2: Manual Setup on Render
1. **Backend Web Service**:
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `PYTHON_VERSION`: `3.11.9`
     - `DATABASE_URL`: `sqlite:///./findme.db` (or a Render PostgreSQL URL)
     - `NIPOST_BASE`: `https://api.nipost.gov.ng`
     - `NIPOST_API_KEY`: *(optional, enter key if available)*

2. **Frontend Static Site**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: `https://<your-backend-service-name>.onrender.com`
   - **Redirects/Rewrites**:
     - Rule: `/*` -> `/index.html` (Rewrite)
