from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from pydantic import BaseModel

# from backend.routes.check_password import router as check_password_router
# from routes.analyze_audio import router as analyze_audio_router
# from backend.routes.get_characters import get_characters_again
# from routes.transcribe import router as transcribe_router
# from routes.dtw import router as dtw_router
# from routes.shift_audio import router as shift_audio_router
# from routes.save_accuracy import router as save_accuracy_router
# from routes.get_highest_accuracies import router as get_highest_accuracies_router
# from routes.updateTest import router as update_test_router

from backend.routes.get_characters import get_characters_again

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Test(BaseModel):
    test: str

@app.post("/get-characters")
async def get_characters(test: Test):
    return
    result = get_characters_again(test)


# app.include_router(check_password_router)
# app.include_router(analyze_audio_router)
# app.include_router(transcribe_router)
# app.include_router(dtw_router)
# app.include_router(shift_audio_router)
# app.include_router(save_accuracy_router)
# app.include_router(get_highest_accuracies_router)
# app.include_router(update_test_router)
