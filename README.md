Web Security Simulation App
===========================

FOR EDUCATIONAL USE ONLY — DO NOT DEPLOY ON PUBLIC NETWORKS — ALL DATA IS SIMULATED — DESIGNED FOR SECURITY AWARENESS TRAINING

Overview
--------
A full-stack app demonstrating SQL Injection and Path Traversal vulnerabilities in a safe sandbox. It includes a Burp Repeater-style UI, file upload, and educational overlays.

Tech Stack
----------
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express + TypeScript, better-sqlite3 (in-memory)
- Database: In-memory SQLite (fake data only)
- Docker: Multi-stage builds, nginx for static client

Quick Start (Docker)
--------------------
1. Prerequisites: Docker, Docker Compose
2. Run: `docker-compose up --build`
3. Open client: `http://localhost:5173`
4. API base: `http://localhost:8080`

Local Development
-----------------
- Terminal 1 (server):
  - `cd server`
  - `npm i`
  - `npm run dev` → http://localhost:8080
- Terminal 2 (client):
  - `cd client`
  - `npm i`
  - `npm run dev` → http://localhost:5173 (proxy to /api)

Core Endpoints
--------------
- GET `/api/user/profile` — SQL Injection via `User-Agent`
- GET `/api/translations/:language` — Path traversal on language file
- POST `/api/documents/download` — Path traversal via body `file`
- POST `/api/upload` — Upload files (JSON, PNG, CSV)
- GET `/api/simulations/list` — Scenarios
- POST `/api/simulation/validate` — Check exploit attempt

Simulations
-----------
- SQLi:
  - Try headers: `Mozilla/5.0' AND 1=1 --` vs `Mozilla/5.0' AND 1=2 --`
  - Extract: `UNION SELECT sqlite_version()` or list tables via `sqlite_master`
- Path Traversal (translations):
  - `/api/translations/../etc/passwd`
- Path Traversal (download):
  - `{ "file": "../../../etc/passwd" }`

All sensitive paths are transparently mapped to mocked content stored under `/tmp/websec-sim/mock_system` to remain safe.

Safety Measures
---------------
- In-memory DB only; fake user data.
- Filesystem sandbox rooted at `/tmp/websec-sim`.
- No outbound network calls.
- Disclaimer headers on all responses.

Project Structure
-----------------
```
server/
client/
```

Extension Points
----------------
- Add scenarios via server route `simulations` and extend UI components.
- Add more file types to upload.
- Add new educational steps in `SimulationGuide`.

License
-------
Educational sample. Use at your own risk.
# Simulation-web