from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import auth, characters, analysis, transcription

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/sounds", StaticFiles(directory="backend/sounds"), name="sounds")

# Include routes
app.include_router(auth.router)
app.include_router(characters.router)
app.include_router(analysis.router)
app.include_router(transcription.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
