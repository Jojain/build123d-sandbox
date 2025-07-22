# build123d-sandbox

A minimal webapp to expose the Python CAD library [build123d](https://github.com/gumyr/build123d) in the browser using a compiled wasm OCP backend.

## Features

- Code editor for writing build123d code
- 3D viewer (three-cad-viewer)
- FastAPI backend
- React frontend (with Vite)
- Dockerized setup
- Python dependency management with `pyproject.toml` and [uv](https://docs.astral.sh/uv/)
- Python 3.13+

## Project Structure

- `backend/` - FastAPI server and Python logic (see `pyproject.toml`)
- `frontend/` - React app for the code editor and viewer (with Vite)
- `Dockerfile` - Containerizes the app

## Getting Started

### Prerequisites

- Docker

### Build and Run

```sh
docker build -t build123d-sandbox .
docker run -p 8000:8000 build123d-sandbox
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Development

- Backend: FastAPI (see `backend/`)
- Frontend: React + Vite (see `frontend/`)
- WASM OCP: Placeholder for now

## License
MIT
