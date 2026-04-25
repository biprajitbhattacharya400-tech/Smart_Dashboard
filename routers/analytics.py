from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
import models

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_analytics(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()

    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.completed)
    pending_tasks = total_tasks - completed_tasks
    completion_rate = round((completed_tasks / total_tasks) * 100, 2) if total_tasks else 0

    tasks_by_day_map = {}
    for task in tasks:
        if not task.created_at:
            continue

        day_key = task.created_at.date().isoformat()
        tasks_by_day_map[day_key] = tasks_by_day_map.get(day_key, 0) + 1

    tasks_by_day = [
        {"date": date, "count": count}
        for date, count in sorted(tasks_by_day_map.items(), key=lambda item: item[0])
    ]

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": completion_rate,
        "tasks_by_day": tasks_by_day,
    }
