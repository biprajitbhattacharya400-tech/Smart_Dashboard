# database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database URL
DATABASE_URL = "sqlite:///./todo.db"

# Create engine (connects to DB)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite
)

# Session (used to talk to DB)
SessionLocal = sessionmaker(bind=engine)

# Base class for models
Base = declarative_base()