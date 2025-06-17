from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Mount frontend build (placeholder path)
app.mount("/", StaticFiles(directory="/app/frontend/build", html=True), name="static")

@app.post("/run")
async def run_build123d_code(request: Request):
    data = await request.json()
    code = data.get("code", "")
    # Placeholder: Run build123d code with wasm OCP
    # result = run_build123d_wasm(code)
    result = {"success": True, "output": "Placeholder result"}
    return JSONResponse(result) 