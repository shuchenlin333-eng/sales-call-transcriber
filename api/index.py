try:
    from app.main import app  # noqa: F401 — Vercel looks for `app` in this file
except Exception as e:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    _error = traceback.format_exc()

    @app.get("/{path:path}")
    @app.post("/{path:path}")
    async def crash_info(path: str = ""):
        return JSONResponse(status_code=500, content={"error": str(e), "traceback": _error})
