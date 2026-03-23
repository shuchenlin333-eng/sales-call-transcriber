import sys
import os
import traceback

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()


@app.get("/_debug")
async def debug():
    error = None
    tb = None
    try:
        from app.main import app as real_app  # noqa: F401
        return {"status": "import ok"}
    except Exception as e:
        error = str(e)
        tb = traceback.format_exc()
    return JSONResponse(status_code=500, content={"error": error, "traceback": tb, "sys_path": sys.path, "cwd": os.getcwd()})


@app.get("/health")
async def health():
    return {"status": "ok"}
