# Dockerfile for build123d-sandbox

# Backend (Python/FastAPI)
FROM python:3.13-slim AS backend
WORKDIR /app
COPY backend/pyproject.toml ./pyproject.toml
RUN pip install uv && uv pip install -r <(uv pip compile pyproject.toml)
COPY backend/ ./

# Frontend (React + Vite)
FROM node:20 AS frontend
WORKDIR /frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm install -g vite && npm install
COPY frontend/ ./
RUN npm run build # Placeholder: ensure vite build is set up

# Final image
FROM python:3.13-slim
WORKDIR /app
COPY --from=backend /app /app
COPY --from=frontend /frontend/dist /app/frontend/dist
# Placeholder for wasm OCP copy step
# COPY path/to/wasm/ocp /app/wasm-ocp
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 