import sys
import os
import traceback

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.get("/_debug")
async def debug():
    try:
        from app.main import app as real_app  # noqa: F401
        return {"status": "import ok"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": traceback.format_exc()})


@app.get("/health")
async def health():
    return {"status": "ok"}
