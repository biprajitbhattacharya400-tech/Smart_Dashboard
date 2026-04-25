from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text

# Create app instance
app = FastAPI()

# -------------------------------
# 1. CORS Middleware
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# 2. Static Files (Frontend)
# -------------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# -------------------------------
# 3. Root Route (Homepage)
# -------------------------------
@app.get("/")
def serve_home():
    return FileResponse("static/index.html")

# -------------------------------
# 4. Test API Route
# -------------------------------
@app.get("/api/test")
def test():
    return {"message": "Backend is working 🚀"}


from routers import todo
app.include_router(todo.router, prefix="/api/todo", tags=["Todo"])

from database import Base, engine
Base.metadata.create_all(bind=engine)


def ensure_task_created_at_column():
    with engine.connect() as connection:
        columns = connection.execute(text("PRAGMA table_info(tasks)")).fetchall()
        has_created_at = any(column[1] == "created_at" for column in columns)

        if not has_created_at:
            connection.execute(text("ALTER TABLE tasks ADD COLUMN created_at DATETIME"))

        # Backfill existing rows so analytics can group historical tasks.
        connection.execute(text("UPDATE tasks SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
        connection.commit()


ensure_task_created_at_column()

from routers import qr
app.include_router(qr.router, prefix="/api/qr", tags=["QR"])


from routers import news
app.include_router(news.router, prefix="/api/news", tags=["News"])

from routers import analytics
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])