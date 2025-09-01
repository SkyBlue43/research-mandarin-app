from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

from backend.routes.get_characters import router as get_characters_router
from backend.routes.check_password import router as check_password_router
from backend.routes.analyze_audio import router as analyze_audio_router
from backend.routes.transcribe import router as transcribe_router
from backend.routes.dtw import router as dtw_router
from backend.routes.shift_audio import router as shift_audio_router
from backend.routes.save_accuracy import router as save_accuracy_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_characters_router)
app.include_router(check_password_router)
app.include_router(analyze_audio_router)
app.include_router(transcribe_router)
app.include_router(dtw_router)
app.include_router(shift_audio_router)
app.include_router(save_accuracy_router)


app.mount("/sounds", StaticFiles(directory="backend/sounds"), name="sounds")
