from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analyze, memo, transcribe

app = FastAPI(
    title="Sales Call Transcriber",
    description="Transcribe sales calls, extract insights, and generate Salesforce-ready payloads.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production to your Vercel frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe.router)
app.include_router(analyze.router)
app.include_router(memo.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
